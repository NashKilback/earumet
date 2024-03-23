import BigNumber from "bignumber.js";
import rewardPoolAbi from "./reward-pool.abi.json";
import { contractAddresses } from "./constants";
import {
  approveErc20IfNeeded,
  getCurrentAccountAddress,
  getNetwork,
  getPendingTrxCallback,
  getTrxOverrides,
  getWeb3,
  normalizeAmount,
  denormalizeAmount,
  processWeb3OrNetworkArgument,
  getFees,
  formatTxConfig,
} from "../common";
import { getAccountLiquidity } from "../uniswap";
import { getAccountLiquidity as getAccountLiquidityBSC } from "../pancakeswap";
import { v2 } from "../pancakeswap";

const PENDING_CALLBACK_PLATFORM = "keyfi rewardpool";

export const isSupportedNetwork = async (web3OrNetwork) => {
  const network = await processWeb3OrNetworkArgument(web3OrNetwork);
  return Boolean(contractAddresses[network.name]);
};

export const getContractAddress = async (web3, contractName) => {
  const network = await getNetwork(web3);

  if (!(await isSupportedNetwork(network))) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  const address = contractAddresses[network.name][contractName];
  if (!address) {
    throw new Error(
      `Unknown contract: '${contractName}' on '${network.name}' network`
    );
  }

  return address;
};

export const getSupportedAssets = async (web3) => {
  if (!web3) {
    web3 = await getWeb3();
  }

  const network = await getNetwork(web3);

  const addresses = contractAddresses[network.name];
  if (!addresses) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  return Object.keys(addresses).filter((asset) => asset !== "RewardPool");
};

export const getBalance = async (accountAddress = null, options = {}) => {
  const web3 = options.web3 ? options.web3 : await getWeb3();
  const network = await getNetwork(web3);

  if (!(await isSupportedNetwork(network))) {
    return {};
  }

  if (!accountAddress) {
    accountAddress = getCurrentAccountAddress(web3);
  }

  const poolAddress = await getContractAddress(web3, "RewardPool");
  const poolContract = new web3.eth.Contract(rewardPoolAbi.abi, poolAddress);

  const balances = {};
  for (const asset of await getSupportedAssets(web3)) {
    const assetAddress = await getContractAddress(web3, asset);

    const assetBalance = await poolContract.methods
      .getBalance(assetAddress)
      .call();

    balances[asset] = denormalizeAmount(network, asset, assetBalance);
  }

  return balances;
};

/**
 * Returns balance with KEYFIUSDCLP amount replaced by KEYFI and USDC staked amount
 * Example:
 *  getBalance() -> { KEY: 100, KEYFIUSDCLP: 0.001 }
 *  getStaked()  -> { KEY: 100, KEYFI: 200, USDC: 20 }
 */
export const getStaked = async (accountAddress, onlyForLP = false) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  let balance = await getBalance(accountAddress, { web3 });

  if (network.chainId === 56) {
    if (onlyForLP) {
      balance = {
        "KEYFI:BUSD": balance["KEYFI:BUSD"],
        "KEYFI:BUSD v2": balance["KEYFI:BUSD v2"],
      };
    }
    if (BigNumber(balance["KEYFI:BUSD"]).gt(0)) {
      const pairBalance = balance["KEYFI:BUSD"];
      delete balance["KEYFI:BUSD"];

      const pair = await getAccountLiquidityBSC("BUSD", "KEYFI", null, {
        balance: normalizeAmount(network, "KEYFI:BUSD", pairBalance),
      });

      balance.KEYFI = BigNumber(balance.KEYFI ? balance.KEYFI : 0)
        .plus(pair.KEYFI)
        .toFixed();
      balance.BUSD = BigNumber(balance.BUSD ? balance.BUSD : 0)
        .plus(pair.BUSD)
        .toFixed();
    }
    if (BigNumber(balance["KEYFI:BUSD v2"]).gt(0)) {
      const pairBalance = balance["KEYFI:BUSD v2"];
      delete balance["KEYFI:BUSD v2"];

      const pair = await v2.getAccountLiquidity("BUSD", "KEYFI", null, {
        balance: normalizeAmount(network, "KEYFI:BUSD v2", pairBalance),
      });

      balance.KEYFI = BigNumber(balance.KEYFI ? balance.KEYFI : 0)
        .plus(pair.KEYFI)
        .toFixed();
      balance.BUSD = BigNumber(balance.BUSD ? balance.BUSD : 0)
        .plus(pair.BUSD)
        .toFixed();
    }
  } else {
    if (onlyForLP) {
      balance = {
        "KEYFI:USDC": balance["KEYFI:USDC"],
      };
    }

    if (BigNumber(balance["KEYFI:USDC"]).gt(0)) {
      const pairBalance = balance["KEYFI:USDC"];
      delete balance["KEYFI:USDC"];

      const pair = await getAccountLiquidity("USDC", "KEYFI", null, {
        balance: normalizeAmount(network, "KEYFI:USDC", pairBalance),
      });

      balance.KEYFI = BigNumber(balance.KEYFI ? balance.KEYFI : 0)
        .plus(pair.KEYFI)
        .toFixed();
      balance.USDC = BigNumber(balance.USDC ? balance.USDC : 0)
        .plus(pair.USDC)
        .toFixed();
    }
  }
  return balance;
};

export const deposit = async (asset, amount, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const assetAddress = await getContractAddress(web3, asset);
  const poolAddress = await getContractAddress(web3, "RewardPool");
  const poolContract = new web3.eth.Contract(rewardPoolAbi.abi, poolAddress);
  const trxOverrides = getTrxOverrides(options);

  await approveErc20IfNeeded(
    web3,
    assetAddress,
    poolAddress,
    nAmount,
    {},
    {
      pendingCallbackParams: {
        callback: options.pendingCallback,
        platform: PENDING_CALLBACK_PLATFORM,
        assets: [
          {
            symbol: asset,
            amount,
          },
        ],
      },
    }
  );

  const fees = await getFees(web3, 20);
  const txConfig = formatTxConfig(network, fees, trxOverrides);

  return poolContract.methods.deposit(assetAddress, nAmount).send(
    {
      from: getCurrentAccountAddress(web3),
      ...txConfig,
      nonce: trxOverrides.nonce ? trxOverrides.nonce + 1 : undefined,
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: "deposit",
      assets: [
        {
          symbol: asset,
          amount,
        },
      ],
    })
  );
};

export const withdraw = async (asset, amount, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const assetAddress = await getContractAddress(web3, asset);
  const poolAddress = await getContractAddress(web3, "RewardPool");
  const poolContract = new web3.eth.Contract(rewardPoolAbi.abi, poolAddress);
  const trxOverrides = getTrxOverrides(options);

  const fees = await getFees(web3, 20);
  const txConfig = formatTxConfig(network, fees, trxOverrides);

  return poolContract.methods.withdraw(assetAddress, nAmount).send(
    {
      from: getCurrentAccountAddress(web3),
      ...txConfig,
      nonce: trxOverrides.nonce ? trxOverrides.nonce + 1 : undefined,
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: "withdraw",
      assets: [
        {
          symbol: asset,
          amount,
        },
      ],
    })
  );
};

export const withdrawReward = async (asset, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  const assetAddress = await getContractAddress(web3, asset);
  const poolAddress = await getContractAddress(web3, "RewardPool");
  const poolContract = new web3.eth.Contract(rewardPoolAbi.abi, poolAddress);
  const trxOverrides = getTrxOverrides(options);

  const fees = await getFees(web3, 20);
  const txConfig = formatTxConfig(network, fees, trxOverrides);

  await approveErc20IfNeeded(
    web3,
    assetAddress,
    poolAddress,
    {},
    {
      pendingCallbackParams: {
        callback: options.pendingCallback,
        platform: PENDING_CALLBACK_PLATFORM,
        assets: [
          {
            symbol: asset,
          },
        ],
      },
    }
  );

  return poolContract.methods.withdrawRewards(assetAddress).send(
    {
      from: getCurrentAccountAddress(web3),
      ...txConfig,
      nonce: trxOverrides.nonce ? trxOverrides.nonce + 1 : undefined,
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: "withdraw_rewards",
      assets: [
        {
          symbol: asset,
        },
      ],
    })
  );
};

export const getRewards = async (accountAddress = null) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  if (!accountAddress) {
    accountAddress = getCurrentAccountAddress(web3);
  }

  const poolAddress = await getContractAddress(web3, "RewardPool");
  const poolContract = new web3.eth.Contract(rewardPoolAbi.abi, poolAddress);

  const rewards = {};
  for (const asset of await getSupportedAssets(web3)) {
    const assetAddress = await getContractAddress(web3, asset);

    const assetReward = await poolContract.methods
      .pendingReward(assetAddress, accountAddress)
      .call();

    rewards[asset] = denormalizeAmount(network, asset, assetReward);
  }

  return rewards;
};
