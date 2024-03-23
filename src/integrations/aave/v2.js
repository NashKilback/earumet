import BigNumber from "bignumber.js";
import {
  approveErc20IfNeeded,
  denormalizeAmount,
  getCurrentAccountAddress,
  getNetwork,
  getPendingTrxCallback,
  getWeb3,
  makeBatchRequest,
  normalizeAmount,
  promisifyBatchRequest,
} from "../common";
import {
  fetchContractDynamicAddress,
  getContractAddress,
  getReserveAddress,
  getReserves,
  isSupportedNetwork,
} from "./constants/constantsv2";

import LendingPoolABI from "./abi/LendingPoolv2.abi.json";
import ProtocolDataABI from "./abi/ProtocolDataProviderv2.abi.json";
import WETHGatewayABI from "./abi/WETHGatewayv2.abi.json";
import PriceOracleABI from "./abi/PriceOraclev2.abi.json";
import axios from "axios";

const GAS_LIMIT = 750000;
const PENDING_CALLBACK_PLATFORM = "aave";

export const getLendingPoolContract = async (web3) => {
  const lpAddress = await fetchContractDynamicAddress(web3, "LendingPool");
  return new web3.eth.Contract(LendingPoolABI, lpAddress);
};

export const getProtocolDataContract = async (web3) => {
  const lpAddress = await getContractAddress("ProtocolData");
  return new web3.eth.Contract(ProtocolDataABI, lpAddress);
};

export const getWETHGatewayContract = async (web3) => {
  const WETHGatewayAddress = await getContractAddress("WETHGateway");
  return new web3.eth.Contract(WETHGatewayABI, WETHGatewayAddress);
};

const getTrxOverrides = async (options) => {
  return {
    gasPrice: options.gasPrice,
    nonce: options.nonce,
  };
};

export const getAddress = (asset) => {
  return getReserveAddress(asset);
};

export const getSupportedAssets = async () => {
  const web3 = await getWeb3();
  const data = await getReserves(web3);

  return [...Object.keys(data), "WETH"];
};

export async function deposit(asset, amount, options = {}) {
  const referralCode = "0";
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const assetAddress = await getAddress(asset);
  if (!assetAddress) {
    throw new Error(`Asset is not supported: '${asset}'`);
  }

  const lp = await getLendingPoolContract(web3);
  const trxOverrides = getTrxOverrides(options);
  const userAddress = getCurrentAccountAddress(web3);
  const lpAddress = await getContractAddress("LendingPool", web3);

  if (asset === "ETH") {
    // Gas cost on Ropsten: 230000+
    const gateway = await getWETHGatewayContract(web3);

    return gateway.methods
      .depositETH(lpAddress, userAddress, referralCode)
      .send(
        {
          from: userAddress,
          value: nAmount,
          gas: GAS_LIMIT,
          ...trxOverrides,
        },
        getPendingTrxCallback(options.pendingCallback, {
          platform: PENDING_CALLBACK_PLATFORM,
          type: "deposit",
          assets: [
            {
              symbol: asset,
              amount: amount,
            },
          ],
        })
      );
  } else {
    await approveErc20IfNeeded(
      web3,
      assetAddress,
      lpAddress,
      nAmount,
      {
        from: getCurrentAccountAddress(web3),
        gas: GAS_LIMIT,
        ...trxOverrides,
      },
      {
        pendingCallbackParams: {
          callback: options.pendingCallback,
          platform: PENDING_CALLBACK_PLATFORM,
          assets: [
            {
              symbol: asset,
              amount: amount,
            },
          ],
        },
      }
    );

    return lp.methods
      .deposit(assetAddress, nAmount, userAddress, referralCode)
      .send(
        {
          from: getCurrentAccountAddress(web3),
          gas: GAS_LIMIT,
          ...trxOverrides,
          nonce: trxOverrides.nonce ? trxOverrides.nonce + 1 : undefined,
        },
        getPendingTrxCallback(options.pendingCallback, {
          platform: PENDING_CALLBACK_PLATFORM,
          type: "deposit",
          assets: [
            {
              symbol: asset,
              amount: amount,
            },
          ],
        })
      );
  }
}

export async function withdraw(asset, amount, options = {}) {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const userAddress = await getCurrentAccountAddress(web3);

  const tokenAddress = await getAddress(asset);
  if (!tokenAddress) {
    throw new Error(`Can't find address for ${asset}`);
  }

  const lp = await getLendingPoolContract(web3);

  return lp.methods.withdraw(tokenAddress, nAmount, userAddress).send(
    {
      from: userAddress,
      gas: GAS_LIMIT,
      ...getTrxOverrides(options),
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: "withdraw",
      assets: [
        {
          symbol: asset,
          amount: amount,
        },
      ],
    })
  );
}

export async function borrow(asset, amount, options = {}) {
  const interestRateMode = options.interestRateMode || "2";
  const referralCode = options.referralCode || "0";
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const assetAddress = await getAddress(asset);
  if (!assetAddress) {
    throw new Error(`Asset is not supported: '${asset}'`);
  }

  const lp = await getLendingPoolContract(web3);
  const userAddress = await getCurrentAccountAddress(web3);
  const trxOverrides = await getTrxOverrides(options);

  return lp.methods
    .borrow(assetAddress, nAmount, interestRateMode, referralCode, userAddress)
    .send(
      {
        from: userAddress,
        gas: GAS_LIMIT,
        ...trxOverrides,
      },
      getPendingTrxCallback(options.pendingCallback, {
        platform: PENDING_CALLBACK_PLATFORM,
        type: "borrow",
        assets: [
          {
            symbol: asset,
            amount: amount,
          },
        ],
      })
    );
}

export async function repay(asset, amount, options = {}) {
  const interestRateMode = options.interestRateMode || "2";

  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const assetAddress = await getAddress(asset);
  const nAmount = normalizeAmount(network, asset, amount);

  const address = getCurrentAccountAddress(web3);

  const lp = await getLendingPoolContract(web3);
  const lpAddress = await getContractAddress("LendingPool", web3);
  const trxOverrides = await getTrxOverrides(options);

  await approveErc20IfNeeded(
    web3,
    assetAddress,
    lpAddress,
    nAmount,
    {
      from: address,
      gas: GAS_LIMIT,
      ...trxOverrides,
    },
    {
      pendingCallbackParams: {
        callback: options.pendingCallback,
        platform: PENDING_CALLBACK_PLATFORM,
        assets: [
          {
            symbol: asset,
            amount: amount,
          },
        ],
      },
    }
  );

  return lp.methods
    .repay(assetAddress, nAmount, interestRateMode, address)
    .send(
      {
        from: address,
        gas: GAS_LIMIT,
        ...trxOverrides,
        nonce: trxOverrides.nonce ? trxOverrides.nonce + 1 : undefined,
      },
      getPendingTrxCallback(options.pendingCallback, {
        platform: PENDING_CALLBACK_PLATFORM,
        type: "repay",
        assets: [
          {
            symbol: asset,
            amount: amount,
          },
        ],
      })
    );
}

export const getBorrowAssets = async () => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  if (!(await isSupportedNetwork(network))) {
    return [];
  }
  const reserves = await getReserves(web3);

  const protocolData = await getProtocolDataContract(web3);

  const borrowAssets = [];
  const batch = new web3.BatchRequest();

  const promises = Object.entries(reserves).map(
    ([reserveSymbol, { address }]) => {
      const p = promisifyBatchRequest(
        batch,
        protocolData.methods.getReserveData(address).call.request
      );
      return p.then((result) => {
        borrowAssets.push({
          symbol: reserveSymbol,
          address: address,
          totalStableDebt: denormalizeAmount(
            network,
            reserveSymbol,
            result.totalStableDebt,
            reserves[reserveSymbol].decimals
          ),
          totalVariableDebt: denormalizeAmount(
            network,
            reserveSymbol,
            result.totalVariableDebt,
            reserves[reserveSymbol].decimals
          ),
          totalDebt: denormalizeAmount(
            network,
            reserveSymbol,
            BigNumber(result.totalVariableDebt).plus(result.totalStableDebt),
            reserves[reserveSymbol].decimals
          ),
          availableLiquidity: denormalizeAmount(
            network,
            reserveSymbol,
            result.availableLiquidity,
            reserves[reserveSymbol].decimals
          ),
          variableAPY: denormalizeAmount(
            network,
            reserveSymbol,
            result.variableBorrowRate,
            27
          ),
          stableAPY: denormalizeAmount(
            network,
            reserveSymbol,
            result.stableBorrowRate,
            27
          ),
        });
      });
    }
  );

  batch.execute();
  await Promise.all(promises);

  const priceOracleAddress = await getContractAddress("PriceOracle");
  const priceOracle = new web3.eth.Contract(PriceOracleABI, priceOracleAddress);

  const prices = await priceOracle.methods
    .getAssetsPrices(Object.values(reserves).map((item) => item.address))
    .call();

  const assetsWithPrice = borrowAssets.map((item, i) => ({
    ...item,
    priceETH: denormalizeAmount(network, "ETH", prices[i]),
  }));

  const configurationData = await makeBatchRequest(
    assetsWithPrice.map(
      (item) =>
        protocolData.methods.getReserveConfigurationData(item.address).call
    )
  );

  return assetsWithPrice.map((item, i) => {
    return {
      ...item,
      ...configurationData[i],
      ltv: configurationData[i].ltv / 100,
    };
  });
};

export const getAssetHistoricalAPY = async (asset) => {
  if (!asset) {
    throw new Error("Missing asset");
  }
  const assetAddress = await getContractAddress(asset);
  const lpProviderAddress = await getContractAddress(
    "LendingPoolAddressesProvider"
  );

  if (!assetAddress) {
    throw new Error(`Provided asset ${asset} isn't supported`);
  }

  const todayMinus1month =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      new Date().getDate()
    ) / 1000;

  const fetchHistoricalAPY = async (step, id) => {
    const res = await axios.post(
      "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
      {
        query: `query myQuery($id: ID!){
          reserve(id: $id) {
            symbol
            paramsHistory(first: 1000, ${
              step !== 1 ? `skip: ${(step - 1) * 1000},` : ""
            } orderDirection: desc, orderBy: timestamp, where: {timestamp_gt: ${todayMinus1month}}) {
              variableBorrowRate
              stableBorrowRate
              timestamp
            }
          }
        }`,
        variables: {
          id,
        },
      }
    );

    let paramsHistory = res.data.errors
      ? []
      : res.data.data.reserve.paramsHistory;

    if (
      paramsHistory.length !== 0 &&
      paramsHistory[paramsHistory.length - 1].timestamp > todayMinus1month
    ) {
      const data2 = await fetchHistoricalAPY(step + 1, id);
      paramsHistory = [...paramsHistory, ...data2];
    }

    return paramsHistory;
  };

  try {
    const idAddress =
      assetAddress.toLowerCase() + lpProviderAddress.toLowerCase();

    const data = await fetchHistoricalAPY(1, idAddress);

    return data.reverse().map((item) => ({
      ...item,
      variableBorrowRate: BigNumber(item.variableBorrowRate)
        .shiftedBy(-27)
        .times(100)
        .toFixed(),
      stableBorrowRate: BigNumber(item.stableBorrowRate)
        .shiftedBy(-27)
        .times(100)
        .toFixed(),
    }));
  } catch (err) {
    return err;
  }
};

export const getBorrowedBalance = async (address = null) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  if (!(await isSupportedNetwork(network))) {
    return {};
  }

  const reserves = await getReserves(web3);

  if (!address) {
    address = getCurrentAccountAddress(web3);
  }

  const protocolData = await getProtocolDataContract(web3);

  const borrowBalance = {};
  const batch = new web3.BatchRequest();

  const promises = Object.entries(reserves).map(
    ([reserveSymbol, { address: reserveAddress, decimals }]) => {
      const p = promisifyBatchRequest(
        batch,
        protocolData.methods.getUserReserveData(reserveAddress, address).call
          .request
      );

      return p.then((result) => {
        borrowBalance[reserveSymbol] = {
          ...result,
          currentStableDebt: denormalizeAmount(
            network,
            reserveSymbol,
            result.currentStableDebt,
            decimals
          ),
          currentVariableDebt: denormalizeAmount(
            network,
            reserveSymbol,
            result.currentVariableDebt,
            decimals
          ),
          totalDebt: denormalizeAmount(
            network,
            reserveSymbol,
            BigNumber(result.currentVariableDebt).plus(
              BigNumber(result.currentStableDebt)
            ),
            decimals
          ),
        };
      });
    }
  );
  batch.execute();
  await Promise.all(promises);

  return borrowBalance;
};

export const getBalance = async (address = null) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const reserves = await getReserves(web3);

  if (!(await isSupportedNetwork(network))) {
    return {};
  }

  if (!address) {
    address = getCurrentAccountAddress(web3);
  }

  const protocolData = await getProtocolDataContract(web3);

  const borrowBalance = {};
  const batch = new web3.BatchRequest();

  const promises = Object.entries(reserves).map(
    ([reserveSymbol, { address: reserveAddress }]) => {
      const p = promisifyBatchRequest(
        batch,
        protocolData.methods.getUserReserveData(reserveAddress, address).call
          .request
      );
      return p.then((result) => {
        borrowBalance[reserveSymbol] = denormalizeAmount(
          network,
          reserveSymbol,
          result.currentATokenBalance,
          reserves[reserveSymbol].decimals
        );
      });
    }
  );
  batch.execute();
  await Promise.all(promises);

  return borrowBalance;
};

export const getUserAccountData = async (address = null) => {
  const web3 = await getWeb3();
  if (!address) {
    address = await getCurrentAccountAddress(web3);
  }

  const lp = await getLendingPoolContract(web3);
  const user = await lp.methods.getUserAccountData(address).call();

  return {
    availableBorrowsETH: BigNumber(user.availableBorrowsETH)
      .shiftedBy(-18)
      .toFixed(),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
    healthFactor: BigNumber(user.healthFactor).shiftedBy(-18).toFixed(),
    ltv: user.ltv / 100,
    totalCollateralETH: BigNumber(user.totalCollateralETH)
      .shiftedBy(-18)
      .toFixed(),
    totalDebtETH: BigNumber(user.totalDebtETH).shiftedBy(-18).toFixed(),
  };
};

export const estimateHealthFactor = (
  assetData,
  amount,
  userData,
  afterRepay = false
) => {
  const { priceETH } = assetData;
  const { totalCollateralETH, totalDebtETH, currentLiquidationThreshold } =
    userData;

  if (!afterRepay) {
    return BigNumber(totalCollateralETH)
      .times(BigNumber(currentLiquidationThreshold).shiftedBy(-4))
      .dividedBy(BigNumber(totalDebtETH).plus(amount * priceETH))
      .toFixed();
  }

  return BigNumber(totalCollateralETH)
    .times(BigNumber(currentLiquidationThreshold).shiftedBy(-4))
    .dividedBy(Math.max(0, BigNumber(totalDebtETH).minus(amount * priceETH)))
    .toFixed();
};
