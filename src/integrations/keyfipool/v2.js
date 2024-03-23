import BigNumber from "bignumber.js";
import rewardPoolAbi from "./reward-pool-v2.abi";
import { contractAddressesv2 } from "./constants";
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

const PENDING_CALLBACK_PLATFORM = "keyfi rewardpool";

const isSupportedNetwork = async (web3OrNetwork) => {
  const network = await processWeb3OrNetworkArgument(web3OrNetwork);
  return Boolean(contractAddressesv2[network.name]);
};

const getContractAddress = async (web3, contractName) => {
  const network = await getNetwork(web3);

  if (!(await isSupportedNetwork(network))) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  const address = contractAddressesv2[network.name][contractName];
  if (!address) {
    throw new Error(
      `Unknown contract: '${contractName}' on '${network.name}' network`
    );
  }

  return address;
};

const getSupportedAssets = async (web3) => {
  if (!web3) {
    web3 = await getWeb3();
  }

  const network = await getNetwork(web3);

  const addresses = contractAddressesv2[network.name];
  if (!addresses) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  return Object.keys(addresses).filter((asset) => asset !== "RewardPool");
};

export const getBalancev2 = async (accountAddress = null, options = {}) => {
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
export const getStakedv2 = async (accountAddress, onlyForLP = false) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  let balance = await getBalancev2(accountAddress, { web3 });

  if (onlyForLP) {
    balance = {
      "KEYFI:ETH": balance["KEYFI:ETH"],
    };
  }

  if (BigNumber(balance["KEYFI:ETH"]).gt(0)) {
    const pairBalance = balance["KEYFI:ETH"];
    delete balance["KEYFI:ETH"];

    const pair = await getAccountLiquidity("ETH", "KEYFI", null, {
      balance: normalizeAmount(network, "KEYFI:ETH", pairBalance),
    });

    balance.KEYFI = BigNumber(balance.KEYFI ? balance.KEYFI : 0)
      .plus(pair.KEYFI)
      .toFixed();
    balance.ETH = BigNumber(balance.ETH ? balance.ETH : 0)
      .plus(pair.ETH)
      .toFixed();
  }

  return balance;
};

export const depositv2 = async (asset, amount, options = {}) => {
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

export const withdrawv2 = async (asset, amount, options = {}) => {
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

export const withdrawRewardv2 = async (asset, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  const assetAddress = await getContractAddress(web3, asset);
  const poolAddress = await getContractAddress(web3, "RewardPool");
  const poolContract = new web3.eth.Contract(rewardPoolAbi.abi, poolAddress);
  const trxOverrides = getTrxOverrides(options);

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
  const fees = await getFees(web3, 20);
  const txConfig = formatTxConfig(network, fees, trxOverrides);

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

export const getRewardsv2 = async (accountAddress = null) => {
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

    rewards[asset] = denormalizeAmount(network, asset, assetReward, 18);
  }

  return rewards;
};
