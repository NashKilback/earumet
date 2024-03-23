import BigNumber from "bignumber.js";

import { ERC20Tokens } from "../../constants";
import {
  availablePairs,
  contractAddresses,
  uniswapContracts,
  PAIR_NOT_EXISTS,
  NULL_ADDRESS,
} from "./constants/constants";
import factoryAbi from "./abi/factory.abi.json";
import routerAbi from "./abi/router02.abi.json";
import pairAbi from "./abi/pair.abi.json";
import {
  approveErc20IfNeeded,
  erc20Addresses,
  getCurrentAccountAddress,
  getNetwork,
  getPendingTrxCallback,
  getTrxOverrides,
  getWeb3,
  normalizeAmount,
  denormalizeAmount,
  processWeb3OrNetworkArgument,
  makeBatchRequest,
} from "../common";

export const DEFAULT_MAX_SLIPPAGE = 0.005;
const GAS_LIMIT = 300000;
const PENDING_CALLBACK_PLATFORM = "uniswap";
const UNSUPPORTED_ASSETS = ["KEYFIUSDCLP", "KEYFIETH_LP"];

const calculateMinAmount = (amount, slippage) =>
  new BigNumber(amount).multipliedBy(1 - slippage).toFixed(0);

const getDefaultDeadline = () => Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes later

export const isSupportedNetwork = async (web3OrNetwork) => {
  const network = await processWeb3OrNetworkArgument(web3OrNetwork);
  return Boolean(availablePairs[network.name]);
};

const getContractAddress = async (web3, contractName) => {
  const network = await getNetwork(web3);
  if (!(await isSupportedNetwork(network))) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  const address = contractAddresses[network.name][contractName];
  if (address) {
    return address;
  }

  if (erc20Addresses[network.name]) {
    const erc20Address = erc20Addresses[network.name][contractName];
    if (erc20Address) {
      return erc20Address;
    }
  }

  if (
    ERC20Tokens.find(
      (token) => token.symbol.toLowerCase() === contractName.toLowerCase()
    )
  ) {
    const token = ERC20Tokens.find(
      (token) => token.symbol.toLowerCase() === contractName.toLowerCase()
    );
    return token.id;
  }

  throw new Error(
    `Unknown contract: '${contractName}' on '${network.name}' network`
  );
};

const getAssetAddress = async (web3, asset) => {
  if (asset === "ETH") {
    return getContractAddress(web3, "WETH");
  }

  return getContractAddress(web3, asset);
};

const getPairAddress = async (web3, assetAAddress, assetBAddress) => {
  const factoryAddress = await getContractAddress(web3, "Factory");
  const factoryContract = new web3.eth.Contract(factoryAbi, factoryAddress);
  const pairAddress = await factoryContract.methods
    .getPair(assetAAddress, assetBAddress)
    .call();

  if (pairAddress === NULL_ADDRESS) {
    const error = new Error("Pair is not exists!");
    error.code = PAIR_NOT_EXISTS;
    throw error;
  }

  return pairAddress;
};

export const isPairAvailable = async (assetA, assetB) => {
  assetA = assetA === "ETH" ? "WETH" : assetA;
  assetB = assetB === "ETH" ? "WETH" : assetB;

  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  if (!(await isSupportedNetwork(network))) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  return availablePairs[network.name].some(
    (x) =>
      (x.assetA === assetA && x.assetB === assetB) ||
      (x.assetA === assetB && x.assetB === assetA)
  );
};

export const getAvailablePairedAssets = async (mainAsset) => {
  mainAsset = mainAsset === "ETH" ? "WETH" : mainAsset;

  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  if (!(await isSupportedNetwork(network))) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  const paired = availablePairs[network.name].reduce(
    (listOfPairedAssets, pair) => {
      if (pair.assetA === mainAsset) {
        listOfPairedAssets.push(pair.assetB);
      } else if (pair.assetB === mainAsset) {
        listOfPairedAssets.push(pair.assetA);
      }

      return listOfPairedAssets;
    },
    []
  );

  if (paired.includes("WETH")) {
    paired.push("ETH");
  }

  return Array.from(new Set(paired));
};

const MAXIMUM_ROUTE_LENGTH = 4;

const findRoute = async (fromAssetSymbol, toAssetSymbol) => {
  if (fromAssetSymbol === toAssetSymbol) {
    throw new Error("fromAssetSymbol and toAssetSymbol are same!");
  }

  if (await isPairAvailable(fromAssetSymbol, toAssetSymbol)) {
    return [fromAssetSymbol, toAssetSymbol];
  }

  let neededRoute = null;
  let routes = [[fromAssetSymbol]];

  while (
    !neededRoute &&
    routes.length > 0 &&
    routes[0].length < MAXIMUM_ROUTE_LENGTH
  ) {
    let newRoutes = [];
    for (const route of routes) {
      const pairedAssets = await getAvailablePairedAssets(
        route[route.length - 1]
      );

      newRoutes = newRoutes.concat(
        pairedAssets.map((asset) => [...route, asset])
      );
    }

    routes = newRoutes;
    neededRoute = routes.find(
      (route) => route[route.length - 1] === toAssetSymbol
    );
  }

  if (!neededRoute) {
    throw new Error(
      `Cannot find route from ${fromAssetSymbol} to ${toAssetSymbol} ` +
        `in ${MAXIMUM_ROUTE_LENGTH} hops`
    );
  }

  return neededRoute;
};

export const estimateSwap = async (
  fromAssetSymbol,
  amount,
  toAssetSymbol,
  reverse = false
) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  const routerAddress = await getContractAddress(web3, "Router02");
  const routerContract = new web3.eth.Contract(routerAbi, routerAddress);

  const route = await findRoute(fromAssetSymbol, toAssetSymbol);
  const routeAddresses = await Promise.all(
    route.map((symbol) => getAssetAddress(web3, symbol))
  );

  let result;

  if (reverse) {
    amount = normalizeAmount(network, toAssetSymbol, amount);
    result = await routerContract.methods
      .getAmountsIn(amount, routeAddresses)
      .call();
  } else {
    amount = normalizeAmount(network, fromAssetSymbol, amount);
    result = await routerContract.methods
      .getAmountsOut(amount, routeAddresses)
      .call();
  }

  const resultFirst = result[0];
  const resultLast = result[result.length - 1];

  const priceImpacts = await Promise.all(
    routeAddresses.map(async (address, i) => {
      const nextAddress = routeAddresses[i + 1];
      if (!nextAddress) {
        return 0;
      }
      const pairAddress = await getPairAddress(web3, address, nextAddress);
      const pairContract2 = new web3.eth.Contract(pairAbi, pairAddress);
      const [{ _reserve0, _reserve1 }, token0] = await makeBatchRequest([
        pairContract2.methods.getReserves().call,
        pairContract2.methods.token0().call,
      ]);
      const lastAddress = web3.utils.toChecksumAddress(nextAddress);
      const lastAddressReserve = BigNumber(
        token0 === lastAddress ? _reserve0 : _reserve1
      );

      return BigNumber(result[i + 1])
        .multipliedBy(0.997)
        .dividedBy(lastAddressReserve)
        .multipliedBy(100)
        .toFixed(3);
    })
  );

  const priceImpact = priceImpacts.reduce((acc, impact) => {
    return acc + parseFloat(impact);
  }, 0);

  return {
    priceImpact,
    fromAmount: resultFirst,
    fromAmountHuman: denormalizeAmount(network, fromAssetSymbol, resultFirst),
    returnAmount: resultLast,
    returnAmountHuman: denormalizeAmount(network, toAssetSymbol, resultLast),
    route,
  };
};

export const swap = async (
  fromAssetSymbol,
  fromAmount,
  toAssetSymbol,
  estimation,
  options = {}
) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const fromAmountDecimalized = normalizeAmount(
    network,
    fromAssetSymbol,
    fromAmount
  );

  if (!estimation || !estimation.returnAmount) {
    throw new Error("No estimation have passed as arg!");
  }

  const accountAddress = getCurrentAccountAddress(web3);
  const trxOverrides = getTrxOverrides(options);
  const routeAddresses = await Promise.all(
    estimation.route.map((assetSymbol) => getAssetAddress(web3, assetSymbol))
  );
  const routerAddress = await getContractAddress(web3, "Router02");

  if (fromAssetSymbol !== "ETH") {
    await approveErc20IfNeeded(
      web3,
      routeAddresses[0],
      routerAddress,
      fromAmountDecimalized,
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
              symbol: fromAssetSymbol,
              amount: fromAmount,
            },
          ],
        },
      }
    );
  }

  const slippage = options.slippage || DEFAULT_MAX_SLIPPAGE;
  const minReturn = new BigNumber(estimation.returnAmount)
    .multipliedBy(1 - slippage)
    .toFixed(0);

  const routerContract = new web3.eth.Contract(routerAbi, routerAddress);
  const deadline = options.deadline || getDefaultDeadline();

  if (fromAssetSymbol === "ETH") {
    return routerContract.methods
      .swapExactETHForTokens(
        minReturn,
        routeAddresses,
        accountAddress,
        deadline
      )
      .send(
        {
          from: accountAddress,
          value: fromAmountDecimalized,
          gas: GAS_LIMIT,
          ...trxOverrides,
        },
        getPendingTrxCallback(options.pendingCallback, {
          platform: PENDING_CALLBACK_PLATFORM,
          type: "swap",
          assets: [
            {
              symbol: fromAssetSymbol,
              amount: fromAmount,
            },
          ],
        })
      );
  }

  const method =
    toAssetSymbol === "ETH"
      ? routerContract.methods.swapExactTokensForETH
      : routerContract.methods.swapExactTokensForTokens;

  return method(
    fromAmountDecimalized,
    minReturn,
    routeAddresses,
    accountAddress,
    deadline
  ).send(
    {
      from: accountAddress,
      gas: GAS_LIMIT,
      ...trxOverrides,
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: "swap",
      assets: [
        {
          symbol: fromAssetSymbol,
          amount: fromAmount,
        },
      ],
    })
  );
};

export const getLiquidity = async (assetA, assetB, options = {}) => {
  const web3 = await getWeb3();

  let assetAAddress = await getAssetAddress(web3, assetA);
  let assetBAddress = await getAssetAddress(web3, assetB);
  if (assetAAddress.toLowerCase() > assetBAddress.toLowerCase()) {
    [assetA, assetB] = [assetB, assetA];
    [assetAAddress, assetBAddress] = [assetBAddress, assetAAddress];
  }

  const pairAddress = await getPairAddress(web3, assetAAddress, assetBAddress);
  const pairContract = new web3.eth.Contract(pairAbi, pairAddress);
  const result = await pairContract.methods.getReserves().call();
  const totalSupply = await pairContract.methods.totalSupply().call();

  if (options.raw) {
    return {
      [assetA]: result._reserve0,
      [assetB]: result._reserve1,
      blockTimestampLast: result._blockTimestampLast,
      totalSupply,
    };
  }

  const network = await getNetwork(web3);

  return {
    [assetA]: denormalizeAmount(network, assetA, result._reserve0),
    [assetB]: denormalizeAmount(network, assetB, result._reserve1),
    blockTimestampLast: result._blockTimestampLast,
    totalSupply: denormalizeAmount(network, "UNI-V2", totalSupply),
  };
};

export const getPrice = async (
  assetWhat,
  assetTo,
  assetWhatBalance,
  options = {}
) => {
  const liquidity = await getLiquidity(assetWhat, assetTo, options);

  const totalSupply = parseFloat(liquidity.totalSupply);
  const token0reserves = parseFloat(liquidity[assetWhat]);
  const token0 = parseFloat(assetWhatBalance);

  const assetSupply = (token0 / token0reserves / 2) * 2 * totalSupply;

  return {
    price: BigNumber(liquidity[assetTo])
      .dividedBy(liquidity[assetWhat])
      .toFixed(),
    [assetWhat]: liquidity[assetWhat],
    [assetTo]: liquidity[assetTo],
    shareOfPool: assetSupply / (totalSupply + assetSupply),
  };
};

export const getAccountLiquidity = async (
  assetA,
  assetB,
  address = null,
  options = {}
) => {
  const web3 = await getWeb3();
  const assetAAddress = await getAssetAddress(web3, assetA);
  const assetBAddress = await getAssetAddress(web3, assetB);

  if (!address) {
    address = getCurrentAccountAddress(web3);
  }

  const pairAddress = await getPairAddress(web3, assetAAddress, assetBAddress);
  const pairContract = new web3.eth.Contract(pairAbi, pairAddress);
  // In case we already know the balance we can pass it as option
  const balance = options.balance
    ? options.balance
    : await pairContract.methods.balanceOf(address).call();
  const totalSupply = await pairContract.methods.totalSupply().call();
  const pairLiquidity = await getLiquidity(assetA, assetB, { raw: true });

  const liquidityPercent = new BigNumber(balance).dividedBy(totalSupply);

  if (options.raw) {
    return {
      assetA,
      assetB,
      [assetA]: liquidityPercent
        .multipliedBy(pairLiquidity[assetA])
        .dividedToIntegerBy(1)
        .toFixed(0),
      [assetB]: liquidityPercent
        .multipliedBy(pairLiquidity[assetB])
        .dividedToIntegerBy(1)
        .toFixed(0),
      liquidity: balance,
      totalLiquidity: totalSupply,
      liquidityPercent: liquidityPercent.toFixed(),
    };
  }

  const network = await getNetwork(web3);

  return {
    assetA,
    assetB,
    [assetA]: liquidityPercent
      .multipliedBy(denormalizeAmount(network, assetA, pairLiquidity[assetA]))
      .toFixed(),
    [assetB]: liquidityPercent
      .multipliedBy(denormalizeAmount(network, assetB, pairLiquidity[assetB]))
      .toFixed(),
    liquidity: denormalizeAmount(network, "UNI-V2", balance),
    totalLiquidity: totalSupply,
    liquidityPercent: liquidityPercent.toFixed(),
  };
};

export const getAccountLiquidityAll = async (address = null, options = {}) => {
  try {
    const web3 = await getWeb3();

    if (!(await isSupportedNetwork(web3))) {
      return [];
    }

    if (!address) {
      address = getCurrentAccountAddress(web3);
    }

    let pairs = [];

    await Promise.all(
      availablePairs.mainnet.map(async (pair) => {
        const pairId = pair.address;

        const pairContract = new web3.eth.Contract(pairAbi, pairId);

        const [totalSupply, balance] = await makeBatchRequest([
          pairContract.methods.totalSupply().call,
          pairContract.methods.balanceOf(address).call,
        ]);

        if (balance !== "0") {
          const liquidityPercent = new BigNumber(balance).dividedBy(
            totalSupply
          );
          const [token0, token1] = await makeBatchRequest([
            pairContract.methods.token0().call,
            pairContract.methods.token1().call,
          ]);

          const [assetA, assetB] = await Promise.all(
            [token0, token1].map(async (token) => {
              const tokenContract = new web3.eth.Contract(pairAbi, token);
              const [symbol, decimals] = await makeBatchRequest([
                tokenContract.methods.symbol().call,
                tokenContract.methods.decimals().call,
              ]);
              return {
                symbol: symbol === "WETH" ? "ETH" : symbol,
                decimals,
              };
            })
          );
          let pairReserves = await pairContract.methods.getReserves().call();
          pairReserves = {
            [assetA.symbol]: pairReserves._reserve0,
            [assetB.symbol]: pairReserves._reserve1,
          };

          const network = await getNetwork(web3);

          const pairObject = {
            assetA: assetA.symbol,
            assetB: assetB.symbol,
            [assetA.symbol]: options.raw
              ? liquidityPercent
                  .multipliedBy(pairReserves[assetA.symbol])
                  .dividedToIntegerBy(1)
                  .toFixed(0)
              : liquidityPercent
                  .multipliedBy(
                    denormalizeAmount(
                      network,
                      assetA.symbol,
                      pairReserves[assetA.symbol],
                      assetB.decimals
                    )
                  )
                  .toFixed(),
            [assetB.symbol]: options.raw
              ? liquidityPercent
                  .multipliedBy(pairReserves[assetB.symbol])
                  .dividedToIntegerBy(1)
                  .toFixed(0)
              : liquidityPercent
                  .multipliedBy(
                    denormalizeAmount(
                      network,
                      assetB.symbol,
                      pairReserves[assetB.symbol],
                      assetB.decimals
                    )
                  )
                  .toFixed(),
            liquidity: options.raw
              ? balance
              : denormalizeAmount(network, "UNI-V2", balance),
            totalLiquidity: totalSupply,
            liquidityPercent: liquidityPercent.toFixed(),
          };
          return pairs.push(pairObject);
        }
      })
    );

    return pairs;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const addLiquidity = async (
  assetA,
  assetAAmount,
  assetB,
  assetBAmount,
  options = {}
) => {
  if (assetA === assetB) {
    throw Error(`assetA (${assetA}) === assetB (${assetB})`);
  }

  if (assetB === "ETH") {
    [assetA, assetB] = [assetB, assetA];
    [assetAAmount, assetBAmount] = [assetBAmount, assetAAmount];
  }

  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const assetAAmountNorm = normalizeAmount(network, assetA, assetAAmount);
  const assetBAmountNorm = normalizeAmount(network, assetB, assetBAmount);

  const account = getCurrentAccountAddress(web3);
  const routerAddress = await getContractAddress(web3, "Router02");
  const assetAAddress = await getAssetAddress(web3, assetA);
  const assetBAddress = await getAssetAddress(web3, assetB);
  const trxOverrides = getTrxOverrides(options);

  if (assetA !== "ETH") {
    await approveErc20IfNeeded(
      web3,
      assetAAddress,
      routerAddress,
      assetAAmountNorm,
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
              symbol: assetA,
              amount: assetAAmount,
            },
          ],
        },
      }
    );
  }

  await approveErc20IfNeeded(
    web3,
    assetBAddress,
    routerAddress,
    assetBAmountNorm,
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
            symbol: assetB,
            amount: assetBAmount,
          },
        ],
      },
    }
  );

  const deadline = options.deadline || getDefaultDeadline();
  const slippage = options.slippage || DEFAULT_MAX_SLIPPAGE;
  const minAmountAssetA = calculateMinAmount(assetAAmountNorm, slippage);
  const minAmountAssetB = calculateMinAmount(assetBAmountNorm, slippage);

  const routerContract = new web3.eth.Contract(routerAbi, routerAddress);

  if (assetA === "ETH") {
    return routerContract.methods
      .addLiquidityETH(
        assetBAddress,
        assetBAmountNorm,
        minAmountAssetB,
        minAmountAssetA,
        account,
        deadline
      )
      .send(
        {
          from: account,
          value: assetAAmountNorm,
          gas: GAS_LIMIT,
          ...trxOverrides,
        },
        getPendingTrxCallback(options.pendingCallback, {
          platform: PENDING_CALLBACK_PLATFORM,
          type: "add liquidity",
          assets: [
            {
              symbol: assetA,
              amount: assetAAmount,
            },
            {
              symbol: assetB,
              amount: assetBAmount,
            },
          ],
        })
      );
  }

  return routerContract.methods
    .addLiquidity(
      assetAAddress,
      assetBAddress,
      assetAAmountNorm,
      assetBAmountNorm,
      minAmountAssetA,
      minAmountAssetB,
      account,
      deadline
    )
    .send(
      {
        from: account,
        gas: GAS_LIMIT,
        ...trxOverrides,
      },
      getPendingTrxCallback(options.pendingCallback, {
        platform: PENDING_CALLBACK_PLATFORM,
        type: "add liquidity",
        assets: [
          {
            symbol: assetA,
            amount: assetAAmount,
          },
          {
            symbol: assetB,
            amount: assetBAmount,
          },
        ],
      })
    );
};

// Percent is float in range 0-1
export const removeLiquidity = async (
  assetA,
  assetB,
  percent,
  options = {}
) => {
  if (assetA === assetB) {
    throw Error(`assetA (${assetA}) === assetB (${assetB})`);
  }

  if (assetB === "ETH") {
    [assetA, assetB] = [assetB, assetA];
  }

  const web3 = await getWeb3();
  const accountAddress = getCurrentAccountAddress(web3);

  const accountLiquidity = await getAccountLiquidity(
    assetA,
    assetB,
    accountAddress,
    { raw: true }
  );

  const liquidityToBurn = new BigNumber(accountLiquidity.liquidity)
    .multipliedBy(percent)
    .dividedToIntegerBy(1)
    .toFixed();

  const routerAddress = await getContractAddress(web3, "Router02");
  const assetAAddress = await getAssetAddress(web3, assetA);
  const assetBAddress = await getAssetAddress(web3, assetB);
  const pairAddress = await getPairAddress(web3, assetAAddress, assetBAddress);
  const trxOverrides = getTrxOverrides(options);

  const network = await getNetwork(web3);

  await approveErc20IfNeeded(
    web3,
    pairAddress,
    routerAddress,
    liquidityToBurn,
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
            symbol: "UNI-V2",
            amount: denormalizeAmount(network, "UNI-V2", liquidityToBurn),
          },
        ],
      },
    }
  );

  const deadline = options.deadline || getDefaultDeadline();
  const slippage = options.slippage || DEFAULT_MAX_SLIPPAGE;

  const reserves = await getLiquidity(assetA, assetB, { raw: true });
  const liquidityPercent = new BigNumber(
    accountLiquidity.liquidityPercent
  ).multipliedBy(percent);

  const minReturnA = calculateMinAmount(
    liquidityPercent.multipliedBy(reserves[assetA]),
    slippage
  );
  const minReturnB = calculateMinAmount(
    liquidityPercent.multipliedBy(reserves[assetB]),
    slippage
  );

  const routerContract = new web3.eth.Contract(routerAbi, routerAddress);

  if (assetA === "ETH") {
    return routerContract.methods
      .removeLiquidityETH(
        assetBAddress,
        liquidityToBurn,
        minReturnB,
        minReturnA,
        accountAddress,
        deadline
      )
      .send(
        {
          from: accountAddress,
          gas: GAS_LIMIT,
          ...trxOverrides,
        },
        getPendingTrxCallback(options.pendingCallback, {
          platform: PENDING_CALLBACK_PLATFORM,
          type: "remove liquidity",
          assets: [
            {
              symbol: assetA,
              amount: denormalizeAmount(network, assetA, minReturnA),
            },
            {
              symbol: assetB,
              amount: denormalizeAmount(network, assetB, minReturnB),
            },
          ],
        })
      );
  }

  return routerContract.methods
    .removeLiquidity(
      assetAAddress,
      assetBAddress,
      liquidityToBurn,
      minReturnA,
      minReturnB,
      accountAddress,
      deadline
    )
    .send(
      {
        from: accountAddress,
        gas: GAS_LIMIT,
        ...trxOverrides,
      },
      getPendingTrxCallback(options.pendingCallback, {
        platform: PENDING_CALLBACK_PLATFORM,
        type: "remove liquidity",
        assets: [
          {
            symbol: assetA,
            amount: denormalizeAmount(network, assetA, minReturnA),
          },
          {
            symbol: assetB,
            amount: denormalizeAmount(network, assetB, minReturnB),
          },
        ],
      })
    );
};

const getSupportedAssetsMapUnfiltered = async () => {
  const web3 = await getWeb3();
  const { name } = await getNetwork(web3);

  // On mainnet we are supporting all available assets
  if (name === "mainnet") {
    return erc20Addresses["mainnet"];
  }

  return Object.entries(contractAddresses[name]).reduce(
    (acc, [assetSymbol, assetAddress]) => {
      if (!uniswapContracts.includes(assetSymbol)) {
        acc[assetSymbol] = assetAddress;
      }

      return acc;
    },
    {}
  );
};

export const getSupportedAssets = async () => {
  return Object.keys(await getSupportedAssetsMapUnfiltered())
    .filter((asset) => !UNSUPPORTED_ASSETS.includes(asset))
    .concat("ETH");
};
