import BigNumber from "bignumber.js";
import swapAbi from "./swap.abi.json";
import {
  approveErc20IfNeeded,
  getCurrentAccountAddress,
  getPendingTrxCallback,
  getTrxOverrides,
  getNetwork,
  getWeb3,
  erc20Abi,
  denormalizeAmount,
  processWeb3OrNetworkArgument,
} from "../common";
import * as compoundApi from "../compound";

const GAS_LIMIT = 250000;
// Deposit to Curve can take 560000+ gas (on ganache at least)
const GAS_LIMIT_DEPOSIT_WITHDRAW = 600000;
const FEE = 0.0002;
const DEFAULT_MAX_SLIPPAGE = 0.01;
const PENDING_CALLBACK_PLATFORM = "curve";

export const addresses = {
  assets: {
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  contracts: {
    swap: "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56",
    token: "0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2",
  },
};

const swapTokenSymbol = "cDAI+cUSDC";

export const isSupportedNetwork = async (web3OrNetwork) => {
  const network = await processWeb3OrNetworkArgument(web3OrNetwork);
  return network.name === "mainnet";
};

const assertSupportedChain = async (network) => {
  if (!(await isSupportedNetwork(network))) {
    throw new Error(`Network chainId=${network.chainId} is not supported!`);
  }
};

export const addLiquidity = async (
  assetA,
  assetAAmount,
  assetB,
  assetBAmount,
  options = {}
) => {
  if (assetA === "cDAI" && assetB === "cUSDC") {
    // Skip - all is ok
  } else if (assetA === "cUSDC" && assetB === "cDAI") {
    [assetA, assetB] = [assetB, assetA];
    [assetAAmount, assetBAmount] = [assetBAmount, assetAAmount];
  } else {
    throw new Error("Only cDAI/cUSDC pair supported by Curve-Compound");
  }

  if (assetAAmount <= 0 && assetBAmount <= 0) {
    throw new Error("At least one asset amount should be above zero");
  }

  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  await assertSupportedChain(network);

  const assets = [
    {
      symbol: assetA,
      amount: assetAAmount,
    },
    {
      symbol: assetB,
      amount: assetBAmount,
    },
  ];

  await Promise.all(
    assets.map(async (asset) => {
      if (asset.amount > 0) {
        asset.exchangeRate = await compoundApi.getExchangeRate(asset.symbol);
      }
    })
  );

  assets.forEach((asset) => {
    if (asset.amount > 0) {
      asset.underlyingSymbol = asset.symbol.slice(1);

      const denormalizedRate = denormalizeAmount(
        network,
        asset.underlyingSymbol,
        BigNumber(asset.exchangeRate).shiftedBy(
          -compoundApi.EXCHANGE_RATE_DECIMALS
        )
      );

      asset.cTokenAmount = BigNumber(asset.amount)
        .dividedBy(denormalizedRate)
        .toFixed(0);

      return;
    }

    asset.cTokenAmount = 0;
  });

  const slippage = options.slippage || DEFAULT_MAX_SLIPPAGE;

  const swapContractAddress = addresses.contracts.swap;
  const swapContract = new web3.eth.Contract(swapAbi, swapContractAddress);
  let resultAmount = await swapContract.methods
    .calc_token_amount(
      assets.map((asset) => asset.cTokenAmount),
      true
    )
    .call();

  resultAmount = BigNumber(resultAmount)
    .multipliedBy(1 - slippage)
    .multipliedBy(1 - FEE)
    .toFixed(0);

  const trxOverrides = getTrxOverrides(options);

  await Promise.all(
    assets.map(async (asset) => {
      if (asset.amount > 0) {
        asset.address = await compoundApi.getContractAddress(
          web3,
          asset.symbol
        );

        await approveErc20IfNeeded(
          web3,
          asset.address,
          swapContractAddress,
          asset.cTokenAmount,
          {
            gas: GAS_LIMIT,
            ...trxOverrides,
          },
          {
            pendingCallbackParams: {
              callback: options.pendingCallback,
              platform: PENDING_CALLBACK_PLATFORM,
              assets: [
                {
                  symbol: asset.symbol,
                  amount: asset.amount,
                },
              ],
            },
          }
        );
      }
    })
  );

  return swapContract.methods
    .add_liquidity(
      assets.map((asset) => asset.cTokenAmount),
      resultAmount
    )
    .send(
      {
        from: getCurrentAccountAddress(web3),
        gas: GAS_LIMIT_DEPOSIT_WITHDRAW,
        ...trxOverrides,
      },
      getPendingTrxCallback(options.pendingCallback, {
        platform: PENDING_CALLBACK_PLATFORM,
        type: "add liquidity",
        assets: assets.map((asset) => ({
          symbol: asset.symbol,
          amount: asset.amount,
        })),
      })
    );
};

export const getAccountLiquidityAll = async (accountAddress = null) => {
  const web3 = await getWeb3();

  if (!accountAddress) {
    accountAddress = getCurrentAccountAddress(web3);
  }

  const network = await getNetwork(web3);
  if (!(await isSupportedNetwork(network))) {
    return [];
  }

  const swapContractAddress = addresses.contracts.swap;
  const swapContract = new web3.eth.Contract(swapAbi, swapContractAddress);

  const swapTokenAddress = addresses.contracts.token;
  const swapTokenContract = new web3.eth.Contract(erc20Abi, swapTokenAddress);

  const blockNumber = await web3.eth.getBlockNumber();
  const swapTokenBalance = await swapTokenContract.methods
    .balanceOf(accountAddress)
    .call();
  const swapTokenSupply = await swapTokenContract.methods.totalSupply().call();

  const tokens = [
    { index: 0, symbol: "DAI" },
    { index: 1, symbol: "USDC" },
  ];

  await Promise.all(
    tokens.map(async (token) => {
      const cErc20Address = await compoundApi.getContractAddress(
        web3,
        `c${token.symbol}`
      );
      const cErc20Contract = new web3.eth.Contract(
        compoundApi.cErc20Abi,
        cErc20Address
      );

      token.exRate = denormalizeAmount(
        network,
        token.symbol,
        BigNumber(
          await cErc20Contract.methods.exchangeRateStored().call()
        ).shiftedBy(-compoundApi.EXCHANGE_RATE_DECIMALS)
      );
      token.supplyRate = await cErc20Contract.methods
        .supplyRatePerBlock()
        .call();
      token.oldBlock = await cErc20Contract.methods.accrualBlockNumber().call();

      // rate = exRate + exRate * supply_rate * (block.number - old_block) / 10 ** 18
      token.rate = BigNumber(token.exRate).multipliedBy(
        BigNumber(token.supplyRate)
          .multipliedBy(blockNumber - token.oldBlock)
          .shiftedBy(-compoundApi.EXCHANGE_RATE_DECIMALS)
          .plus(1)
      );

      token.stakedRaw = await swapContract.methods.balances(token.index).call();
      token.staked = token.rate.multipliedBy(token.stakedRaw);

      // balance = swap.balance * (swap_token.balance / swap_token.total_supply)
      token.balance = token.staked
        .multipliedBy(swapTokenBalance)
        .dividedBy(swapTokenSupply);
    })
  );

  // DEBUG
  // return tokens.map((obj) => {
  //   const newObj = {};
  //   for (const key of Object.keys(obj)) {
  //     if (obj[key] instanceof BigNumber) {
  //       newObj[key] = obj[key].toFixed(10);
  //     } else {
  //       newObj[key] = obj[key];
  //     }
  //   }
  //   return newObj;
  // })

  if (tokens[0].balance.plus(tokens[1].balance).eq(0)) {
    return [];
  }

  return [
    {
      DAI: tokens[0].balance.toFixed(),
      USDC: tokens[1].balance.toFixed(),
      assetA: "DAI",
      assetB: "USDC",
    },
  ];
};

export const removeLiquidity = async (
  assetA,
  assetB,
  percent,
  options = {}
) => {
  if (assetA === "cDAI" && assetB === "cUSDC") {
    // Skip - all is ok
  } else if (assetA === "cUSDC" && assetB === "cDAI") {
    [assetA, assetB] = [assetB, assetA];
  } else {
    throw new Error("Only cDAI/cUSDC pair supported by Curve-Compound");
  }

  const web3 = await getWeb3();
  const accountAddress = getCurrentAccountAddress(web3);

  const swapTokenAddress = addresses.contracts.token;
  const swapTokenContract = new web3.eth.Contract(erc20Abi, swapTokenAddress);

  const swapTokenBalance = await swapTokenContract.methods
    .balanceOf(accountAddress)
    .call();
  const swapTokenSupply = await swapTokenContract.methods.totalSupply().call();

  const swapContractAddress = addresses.contracts.swap;
  const swapContract = new web3.eth.Contract(swapAbi, swapContractAddress);

  const assets = [
    { index: 0, symbol: "DAI" },
    { index: 1, symbol: "USDC" },
  ];

  const slippage = options.slippage || DEFAULT_MAX_SLIPPAGE;

  await Promise.all(
    assets.map(async (asset) => {
      asset.stakedRaw = await swapContract.methods.balances(asset.index).call();

      asset.minReturn = BigNumber(swapTokenBalance)
        .multipliedBy(percent)
        .multipliedBy(asset.stakedRaw)
        .dividedBy(swapTokenSupply)
        .multipliedBy(1 - slippage)
        .toFixed(0);
    })
  );

  const swapTokenAmount = BigNumber(swapTokenBalance)
    .multipliedBy(percent)
    .toFixed(0);
  const minReturns = assets.map((token) => token.minReturn);

  const trxOverrides = getTrxOverrides(options);
  const network = await getNetwork(web3);

  await approveErc20IfNeeded(
    web3,
    swapTokenAddress,
    swapContractAddress,
    swapTokenAmount,
    {
      gas: GAS_LIMIT,
      ...trxOverrides,
    },
    {
      pendingCallbackParams: {
        callback: options.pendingCallback,
        platform: PENDING_CALLBACK_PLATFORM,
        assets: [
          {
            symbol: swapTokenSymbol,
            amount: denormalizeAmount(
              network,
              swapTokenSymbol,
              swapTokenAmount
            ),
          },
        ],
      },
    }
  );

  return swapContract.methods
    .remove_liquidity(swapTokenAmount, minReturns)
    .send(
      {
        from: accountAddress,
        gas: GAS_LIMIT_DEPOSIT_WITHDRAW,
        ...trxOverrides,
      },
      getPendingTrxCallback(options.pendingCallback, {
        platform: PENDING_CALLBACK_PLATFORM,
        type: "remove liquidity",
        assets: assets.map((asset) => ({
          symbol: asset.symbol,
          amount: denormalizeAmount(network, asset.symbol, asset.minReturn),
        })),
      })
    );
};

export const getSupportedAssets = async () => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  await assertSupportedChain(network);

  return addresses.assets;
};
