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
} from "../common";
import {
  accountNumbers,
  actionType,
  contractAddresses,
  supportedAssets,
  marketId,
} from "./constants";
import SoloMarginAbi from "./solo-margin.abi.json";
import PayableSoloMarginAbi from "./payable-solo-margin.abi.json";

// Deposit can take more than 200000+ of gas
const GAS_LIMIT = 250000;
const PENDING_CALLBACK_PLATFORM = "dydx";

export const isSupportedNetwork = async (web3OrNetwork) => {
  const network = await processWeb3OrNetworkArgument(web3OrNetwork);
  return Boolean(contractAddresses[network.name]);
};

const getContractAddress = async (web3, contractName) => {
  const network = await getNetwork(web3);

  if (!await isSupportedNetwork(network)) {
    throw new Error(
      `Network chainId=${network.chainId} name=${network.name} is not supported!`
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

export const getBalance = async (accountAddress = null) => {
  const web3 = await getWeb3();
  const network = await getNetwork(web3);

  if (!await isSupportedNetwork(web3)) {
    return {};
  }

  if (!accountAddress) {
    accountAddress = getCurrentAccountAddress(web3);
  }

  const soloAddress = await getContractAddress(web3, "SoloMargin");
  const soloContract = new web3.eth.Contract(SoloMarginAbi, soloAddress);

  const result = await soloContract.methods.getAccountBalances({
    owner: accountAddress,
    number: accountNumbers.SPOT,
  }).call();

  const weiBalance = result["2"];
  const balance = {};

  for (const symbol of supportedAssets) {
    balance[symbol] = denormalizeAmount(
      network,
      symbol,
      weiBalance[
        symbol === "ETH" ? marketId.WETH : marketId[symbol]
      ].value
    );
  }

  return balance;
};

export const deposit = async (asset, amount, options = {}) => {
  if (!supportedAssets.includes(asset)) {
    throw new Error(`Asset ${asset} is not supported`);
  }

  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);
  const trxOverrides = getTrxOverrides(options);
  const accountAddress = await getCurrentAccountAddress(web3);

  let trxValue = 0;
  let soloAddress = await getContractAddress(web3, "SoloMargin");
  let soloContract = new web3.eth.Contract(SoloMarginAbi, soloAddress);
  let transferFromAddress = accountAddress;

if (asset !== "ETH") {
    const assetAddress = await getContractAddress(web3, asset);

    await approveErc20IfNeeded(
      web3,
      assetAddress,
      soloAddress,
      nAmount,
      {
        gas: GAS_LIMIT,
        ...trxOverrides,
      },
      {
        pendingCallbackParams: {
          callback: options.pendingCallback,
          platform: PENDING_CALLBACK_PLATFORM,
          assets: [{
            symbol: asset,
            amount: amount,
          }],
        }
      },
    );
  } else {
    // ETH should be deposited through payable proxy contract
    soloAddress = await getContractAddress(web3, "PayableSoloMargin");
    soloContract = new web3.eth.Contract(PayableSoloMarginAbi, soloAddress);
    transferFromAddress = soloAddress;
    trxValue = nAmount;
  }

  const sendArgs = [
    [{
      owner: accountAddress,
      number: accountNumbers.SPOT,
    }],
    [{
      amount: {
        sign: true,
        denomination: 0,
        ref: 0,
        value: nAmount,
      },
      accountId: 0,
      actionType: actionType.Deposit,
      primaryMarketId: asset === "ETH" ? marketId.WETH : marketId[asset],
      secondaryMarketId: "0",
      otherAddress: transferFromAddress,
      otherAccountId: "0",
      data: [],
    }]
  ];

  if (asset === "ETH") {
    sendArgs.push(accountAddress);
  }

  return soloContract.methods.operate(...sendArgs).send(
    {
      from: accountAddress,
      gas: GAS_LIMIT,
      value: trxValue,
      ...trxOverrides,
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: "deposit",
      assets: [{
        symbol: asset,
        amount: amount,
      }],
    }),
  );
};

export const withdraw = async (asset, amount, options = {}) => {
  if (!supportedAssets.includes(asset)) {
    throw new Error(`Asset ${asset} is not supported`);
  }

  const web3 = await getWeb3();
  const network = await getNetwork(web3);
  const nAmount = normalizeAmount(network, asset, amount);
  const trxOverrides = getTrxOverrides(options);
  const accountAddress = await getCurrentAccountAddress(web3);

  let trxValue = 0;
  let soloAddress = await getContractAddress(web3, "SoloMargin");
  let soloContract = new web3.eth.Contract(SoloMarginAbi, soloAddress);
  let transferFromAddress = accountAddress;

  if (asset === "ETH") {
    soloAddress = await getContractAddress(web3, "PayableSoloMargin");
    soloContract = new web3.eth.Contract(PayableSoloMarginAbi, soloAddress);
    transferFromAddress = soloAddress;
  }

  const sendArgs = [
    [{
      owner: accountAddress,
      number: accountNumbers.SPOT,
    }],
    [{
      amount: {
        sign: false,
        denomination: 0,
        ref: 0,
        value: nAmount,
      },
      accountId: 0,
      actionType: actionType.Withdraw,
      primaryMarketId: asset === "ETH" ? marketId.WETH : marketId[asset],
      secondaryMarketId: "0",
      otherAddress: transferFromAddress,
      otherAccountId: "0",
      data: [],
    }]
  ];

  if (asset === "ETH") {
    sendArgs.push(accountAddress);
  }

  return soloContract.methods.operate(...sendArgs).send(
    {
      from: accountAddress,
      gas: GAS_LIMIT,
      value: trxValue,
      ...trxOverrides,
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: "withdraw",
      assets: [{
        symbol: asset,
        amount: amount,
      }],
    }),
  );
};

export const getSupportedAssets = () => supportedAssets;