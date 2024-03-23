import BigNumber from "bignumber.js";
import cErc20Abi from "./abi/cErc20.abi.json";
import cEther from "./abi/cEther.abi.json";
import comptrollerAbi from "./abi/comptroller.abi.json";
import erc20Abi from "./abi/erc20.abi.json";
import UniswapAnchoredViewAbi from "./abi/UniswapAnchoredView.json";
import { contractAddresses, cTokens, supportedAssets } from "./constants";
import {
  approveErc20IfNeeded,
  getBalanceEth,
  getBalanceErc20,
  getCurrentAccountAddress,
  getNetwork,
  getPendingTrxCallback,
  getTrxOverrides,
  getWeb3,
  normalizeAmount,
  denormalizeAmount,
  processWeb3OrNetworkArgument,
} from "../common";
import axios from "axios";

const GAS_LIMIT = 250000;
// Deposit of DAI can took 320000+ of gas
const GAS_LIMIT_DEPOSIT = 400000;
const PENDING_CALLBACK_PLATFORM = "compound";

export const EXCHANGE_RATE_DECIMALS = 18;

export { cErc20Abi };

export const isSupportedNetwork = async (web3OrNetwork) => {
  const network = await processWeb3OrNetworkArgument(web3OrNetwork);
  return Boolean(contractAddresses[network.name]);
};

export const getContractAddress = async (
  web3,
  contractName,
  specificNetwork = null
) => {
  const network = await getNetwork(web3);

  if (!(await isSupportedNetwork(network))) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  const networkName = specificNetwork ? specificNetwork : network.name;

  const address = contractAddresses[networkName][contractName];
  if (!address) {
    throw new Error(
      `Unknown contract: '${contractName}' on '${network.name}' network`
    );
  }

  return address;
};

export const getSupportedAssets = () => supportedAssets;

export const getBalance = async (accountAddress = null, options = {}) => {
  const web3 = await getWeb3();

  if (!(await isSupportedNetwork(web3))) {
    return {};
  }

  if (!accountAddress) {
    accountAddress = getCurrentAccountAddress(web3);
  }

  // Fetch cToken balances
  const balance = {};
  const cTokensSymbols = options.cTokens || cTokens;

  await Promise.all(
    cTokensSymbols.map(async (cTokenSymbol) => {
      const cTokenAddress = await getContractAddress(web3, cTokenSymbol);

      const cTokenContract = new web3.eth.Contract(
        cTokenSymbol === "cETH" ? cEther : cErc20Abi,
        cTokenAddress
      );

      const result = await cTokenContract.methods
        .balanceOfUnderlying(accountAddress)
        .call();

      const network = await getNetwork(web3);
      const originalToken = cTokenSymbol.slice(1);
      const cTokenBalance = denormalizeAmount(network, originalToken, result);

      if (cTokenBalance > 0) {
        balance[originalToken] = denormalizeAmount(
          network,
          originalToken,
          result
        );
      } else {
        balance[originalToken] = 0;
      }
    })
  );

  return balance;
};

export const getUserAccountData = async (address = null) => {
  const web3 = await getWeb3();

  if (!address) {
    address = await getCurrentAccountAddress(web3);
  }

  const comptrollerAddress = await getContractAddress(web3, "Comptroller");
  const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

  const { 1: liquidity } = await comptroller.methods
    .getAccountLiquidity(address)
    .call();

  let availableBorrowsETH;

  // Get ETH Price to get availableBorrowsETH
  const priceViewAddress = await getContractAddress(
    web3,
    "UniswapAnchoredView"
  );

  const priceView = new web3.eth.Contract(
    UniswapAnchoredViewAbi,
    priceViewAddress
  );
  const ETHPrice = await priceView.methods.price("ETH").call();

  availableBorrowsETH = BigNumber(liquidity)
    .shiftedBy(-18)
    .dividedBy(BigNumber(ETHPrice).shiftedBy(-6))
    .toFixed();

  const {
    data: { accounts },
  } = await axios.get(
    `https://api.compound.finance/api/v2/account?addresses[]=${address}`
  );

  const userAccount = accounts[0];

  if (userAccount) {
    return {
      availableBorrowsETH,
      healthFactor: userAccount.health ? userAccount.health.value : "0",
      totalCollateralETH: userAccount.total_borrow_value_in_eth.value,
      totalDebtETH: userAccount.total_borrow_value_in_eth.value,
    };
  }
  return {
    availableBorrowsETH,
    healthFactor: "0",
    totalCollateralETH: "0",
    totalDebtETH: "0",
  };
};

export const getETHPrice = async () => {
  const web3 = await getWeb3();

  // Get ETH Price to get availableBorrowsETH
  const priceViewAddress = await getContractAddress(
    web3,
    "UniswapAnchoredView"
  );

  const priceView = new web3.eth.Contract(
    UniswapAnchoredViewAbi,
    priceViewAddress
  );
  const ETHPrice = await priceView.methods.price("ETH").call();

  return BigNumber(ETHPrice).shiftedBy(-6).toFixed();
};

export const deposit = async (asset, amount, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const balance =
    asset === "ETH" ? await getBalanceEth() : await getBalanceErc20(asset);

  if (BigNumber(balance).lt(amount)) {
    throw new Error("Not enough funds!");
  }

  const cTokenSymbol = "c" + asset;
  const cTokenAddress = await getContractAddress(web3, cTokenSymbol);

  const cTokenContract = new web3.eth.Contract(
    cTokenSymbol === "cETH" ? cEther : cErc20Abi,
    cTokenAddress
  );
  const trxOverrides = getTrxOverrides(options);

  if (asset === "ETH") {
    return cTokenContract.methods.mint().send(
      {
        from: getCurrentAccountAddress(web3),
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
    const assetAddress = await getContractAddress(web3, asset);

    await approveErc20IfNeeded(
      web3,
      assetAddress,
      cTokenAddress,
      nAmount,
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
              symbol: asset,
              amount: amount,
            },
          ],
        },
      }
    );

    return cTokenContract.methods.mint(nAmount).send(
      {
        from: getCurrentAccountAddress(web3),
        gas: GAS_LIMIT_DEPOSIT,
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
};

export const withdraw = async (asset, amount, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const assetBalance = await getBalance(null, { cTokens: [`c${asset}`] });
  if (BigNumber(assetBalance[asset]).lt(amount)) {
    throw new Error("Not enough funds!");
  }

  const cTokenSymbol = "c" + asset;
  const cTokenAddress = await getContractAddress(web3, cTokenSymbol);

  const cTokenContract = new web3.eth.Contract(
    cTokenSymbol === "cETH" ? cEther : cErc20Abi,
    cTokenAddress
  );

  return cTokenContract.methods.redeemUnderlying(nAmount).send(
    {
      from: getCurrentAccountAddress(web3),
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
};

export const enableCollateral = async (address, asset) => {
  if (!asset) {
    throw new Error("Asset hasn't been provided");
  }
  const web3 = await getWeb3();
  if (!address) {
    address = getCurrentAccountAddress(web3);
  }
  const cTokenSymbol = "c" + asset;
  const cTokenAddress = await getContractAddress(web3, cTokenSymbol);

  const comptrollerAddress = await getContractAddress(web3, "Comptroller");

  const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

  return comptroller.methods
    .enterMarkets([cTokenAddress])
    .send({ from: address });
};

export const getAccountLiquidity = async (address = null) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  if (!address) {
    address = await getCurrentAccountAddress(web3);
  }

  const comptrollerAddress = await getContractAddress(web3, "Comptroller");
  const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

  const cEthAddress = await getContractAddress(web3, "cETH");

  const { 1: liquidity } = await comptroller.methods
    .getAccountLiquidity(address)
    .call();

  const { 1: collateralFactor } = await comptroller.methods
    .markets(cEthAddress)
    .call();

  return {
    liquidity: denormalizeAmount(network, "ETH", liquidity),
    collateralFactor: `${
      denormalizeAmount(network, "ETH", collateralFactor) * 100
    }`,
  };
};

export const borrow = async (asset, amount, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  const cTokenSymbol = `c${asset}`;
  const cTokenAddress = await getContractAddress(web3, cTokenSymbol);

  const cTokenContract = new web3.eth.Contract(
    cTokenSymbol === "cETH" ? cEther : cErc20Abi,
    cTokenAddress
  );

  const comptrollerAddress = await getContractAddress(web3, "Comptroller");
  const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);
  const cEthAddress = await getContractAddress(web3, "cETH");

  let markets = [cEthAddress]; // This is the cToken contract(s) for your collateral
  await comptroller.methods.enterMarkets(markets).send({
    from: getCurrentAccountAddress(web3),
    gas: GAS_LIMIT,
  });

  await cTokenContract.methods.borrow(nAmount.toString()).send(
    {
      from: getCurrentAccountAddress(web3),
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(20000000000),
      ...getTrxOverrides(options),
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

  const balance = await cTokenContract.methods
    .borrowBalanceCurrent(getCurrentAccountAddress(web3))
    .call();

  return balance;
};

export const getBorrowAssets = async () => {
  const web3 = await getWeb3();

  try {
    const {
      data: { cToken },
    } = await axios.get("https://api.compound.finance/api/v2/ctoken");

    return cToken.map((item) => {
      return {
        symbol: item.underlying_symbol,
        address: item.underlying_address
          ? web3.utils.toChecksumAddress(item.underlying_address)
          : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        totalVariableDebt: item.total_borrows.value,
        totalDebt: item.total_borrows.value,
        availableLiquidity: item.cash.value,
        variableAPY: BigNumber(item.comp_borrow_apy.value)
          .dividedBy(100)
          .toFixed(),
        priceETH: item.underlying_price.value,
        stableAPY: "0",
      };
    });
  } catch (err) {
    return err;
  }
};

export const getAssetHistoricalAPY = async (asset) => {
  const web3 = await getWeb3();
  if (!asset) {
    throw new Error("Missing asset");
  }

  const assetAddress = await getContractAddress(web3, "c" + asset, "mainnet");

  try {
    const today = parseInt(new Date().getTime() / 1000); // Epoch time
    const todayMinus1Month = parseInt(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        new Date().getDate()
      ) / 1000
    );
    const { data } = await axios.get(
      `https://api.compound.finance/api/v2/market_history/graph?asset=${assetAddress}&min_block_timestamp=${todayMinus1Month}&max_block_timestamp=${today}&num_buckets=50`
    );

    return data.borrow_rates.map((item) => {
      return {
        variableBorrowRate: BigNumber(item.rate).times(100).toFixed(),
        timestamp: item.block_timestamp,
      };
    });
  } catch (err) {
    return err;
  }
};

export const getBorrowedBalance = async (address = null, options = {}) => {
  try {
    const web3 = await getWeb3();
    const network = await getNetwork(web3);

    if (!(await isSupportedNetwork(web3))) {
      return {};
    }

    if (!address) {
      address = getCurrentAccountAddress(web3);
    }

    // Fetch cToken borrow balances
    const borrowBalance = {};
    const cTokensSymbols = options.cTokens || cTokens;

    await Promise.all(
      cTokensSymbols.map(async (cToken) => {
        const cTokenAddress = await getContractAddress(web3, cToken);
        const cTokenContract = new web3.eth.Contract(
          cToken === "ETH" ? cEther : cErc20Abi,
          cTokenAddress
        );

        const result = await cTokenContract.methods
          .borrowBalanceCurrent(address)
          .call();

        const originalToken = cToken.slice(1);
        borrowBalance[originalToken] = {
          currentVariableDebt: denormalizeAmount(
            network,
            originalToken,
            result
          ),
          totalDebt: denormalizeAmount(network, originalToken, result),
        };
      })
    );

    return borrowBalance;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const borrowBalance = async (asset, address = null) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  if (!address) {
    address = getCurrentAccountAddress(web3);
  }

  const cTokenSymbol = `c${asset}`;
  const cTokenAddress = await getContractAddress(web3, cTokenSymbol);
  const cTokenContract = new web3.eth.Contract(cErc20Abi, cTokenAddress);

  const balance = await cTokenContract.methods
    .borrowBalanceCurrent(address)
    .call();

  return {
    [asset]: denormalizeAmount(network, asset, balance),
  };
};

export const repay = async (asset, amount, address, options = {}) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);

  if (!(await isSupportedNetwork(web3))) {
    return {};
  }

  if (!address) {
    address = getCurrentAccountAddress(web3);
  }

  const cTokenSymbol = `c${asset}`;
  const tokenAddress = await getContractAddress(web3, asset);
  const cTokenAddress = await getContractAddress(web3, cTokenSymbol);
  const tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);

  await tokenContract.methods.approve(cTokenAddress, nAmount).send({
    from: address,
    gasLimit: web3.utils.toHex(500000),
    gasPrice: web3.utils.toHex(20000000000),
    ...getTrxOverrides(options),
  });

  const cTokenContract = new web3.eth.Contract(
    cTokenSymbol === "cETH" ? cEther : cErc20Abi,
    cTokenAddress
  );

  return await cTokenContract.methods.repayBorrow(nAmount).send({
    from: address,
    gasLimit: web3.utils.toHex(500000),
    gasPrice: web3.utils.toHex(20000000000),
    ...getTrxOverrides(options),
  });
};

export const getExchangeRate = async (cTokenSymbol) => {
  if (!cTokenSymbol.startsWith("c")) {
    throw new Error(`'${cTokenSymbol}' is not cToken`);
  }

  const web3 = await getWeb3();
  const cTokenAddress = await getContractAddress(web3, cTokenSymbol);

  const cTokenContract = new web3.eth.Contract(
    cTokenSymbol === "cETH" ? cEther : cErc20Abi,
    cTokenAddress
  );

  return cTokenContract.methods.exchangeRateCurrent().call();
};

export const estimateHealthFactor = (
  assetData,
  amount,
  userData,
  afterRepay = false
) => {
  const { priceETH } = assetData;
  const { totalCollateralETH, totalDebtETH } = userData;

  if (!afterRepay) {
    return BigNumber(totalCollateralETH)
      .dividedBy(BigNumber(totalDebtETH).plus(amount * priceETH))
      .toFixed();
  }

  return BigNumber(totalCollateralETH)
    .dividedBy(BigNumber(totalDebtETH).minus(amount * priceETH))
    .toFixed();
};
