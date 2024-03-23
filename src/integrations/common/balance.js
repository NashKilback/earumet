import axios from "axios";
import BigNumber from "bignumber.js";

import {
  getCurrentAccountAddress,
  getNetwork,
  getWeb3,
  promisifyBatchRequest,
} from "./web3";
import { denormalizeAmount } from "./math";
import { coingeckoAssetsIds, erc20Addresses } from "./constants";
import erc20Abi from "./erc20.abi.json";

export const getBalanceErc20 = async (assetOrAssets, holderAddress = null) => {
  let assetsOrAddresses = assetOrAssets;
  if (typeof assetsOrAddresses === "string") {
    assetsOrAddresses = [assetsOrAddresses];
  }

  const web3 = await getWeb3();

  if (!holderAddress) {
    holderAddress = getCurrentAccountAddress(web3);
  }

  const net = await getNetwork(web3);
  const addresses = erc20Addresses[net.name];
  if (!addresses) {
    throw new Error(
      `Network chainId=${net.chainId}, name=${net.name} is not supported!`
    );
  }

  const assetsInfo = [];
  for (const assetOrAddress of assetsOrAddresses) {
    if (web3.utils.isAddress(assetOrAddress)) {
      assetsInfo.push({
        contractAddress: assetOrAddress,
        symbol: null,
      });
    } else {
      const address = addresses[assetOrAddress];
      if (!address) {
        throw new Error(
          `Cannot find token '${assetOrAddress}' on '${net.name}' network!`
        );
      }

      assetsInfo.push({
        contractAddress: address,
        symbol: assetOrAddress,
      });
    }
  }

  const batch = new web3.BatchRequest();
  const promises = [];

  for (const { contractAddress, symbol } of assetsInfo) {
    const contract = new web3.eth.Contract(erc20Abi, contractAddress);
    const promise = promisifyBatchRequest(
      batch,
      contract.methods.balanceOf(holderAddress).call.request
    );
    promises.push(
      symbol ? promise.then((b) => denormalizeAmount(net, symbol, b)) : promise
    );
  }

  batch.execute();

  const results = await Promise.all(promises);
  if (typeof assetOrAssets === "string") {
    return results[0];
  }
  return results;
};

export const getBalanceEth = async (holderAddress) => {
  const web3 = await getWeb3();

  if (!holderAddress) {
    holderAddress = getCurrentAccountAddress(web3);
  }

  const network = await getNetwork(web3);
  const balance = await web3.eth.getBalance(holderAddress);
  return denormalizeAmount(network, "ETH", balance);
};

const ZERO_USD_PRICE_TOKENS = [
  "KEYFIUSDCLP",
  "KEYFIBUSD_LP",
  "KEYFIBUSDLPv2",
  "KEYFIETH_LP",
];

export const getUsdPrice = async (assetOrAssets) => {
  let assets = assetOrAssets;
  if (typeof assetOrAssets === "string") {
    assets = [assets];
  }

  assets = assets.map((symbol) => {
    const coingeckoId = coingeckoAssetsIds[symbol] || null;

    if (!coingeckoId && !ZERO_USD_PRICE_TOKENS.includes(symbol)) {
      throw new Error(`Asset is not supported: '${symbol}'`);
    }

    return {
      symbol,
      coingeckoId,
    };
  });

  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${assets
      .map((x) => x.coingeckoId)
      .filter((x) => x)
      .join(",")}&vs_currencies=usd`
  );

  assets.forEach((asset) => {
    const { coingeckoId } = asset;

    if (coingeckoId) {
      asset.usdPrice = response.data[coingeckoId]?.usd;
    } else {
      asset.usdPrice = 0;
    }
  });

  if (typeof assetOrAssets === "string") {
    return assets[0].usdPrice;
  }

  return assets.reduce((acc, asset) => {
    acc[asset.symbol] = asset.usdPrice;
    return acc;
  }, {});
};

export const getKeyfiUsdPrice = async (holderAddress) => {
  const web3 = await getWeb3();

  if (!holderAddress) {
    holderAddress = getCurrentAccountAddress(web3);
  }

  const network = await getNetwork();

  if (network.name === "mainnet") {
    const response = await axios.post(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      {
        query: `{
    pairHourDatas(first: 1, orderBy: hourStartUnix, orderDirection: desc, where: {pair: "0xb99c23a9a444ebeb0ce4a67f27dab8d4826b1108"}) {
    reserve0
      reserve1
    }
}`,
      }
    );

    const keyfiData = response.data.data.pairHourDatas[0];

    if (!keyfiData) {
      throw new Error("Didn't find KEYFI token in graphql query result!");
    }
    const keyfiPrice = BigNumber(keyfiData.reserve0)
      .dividedBy(keyfiData.reserve1)
      .toFixed(5);
    return keyfiPrice;
  }

  if (network.name === "bsc-mainnet" || network.name === "bsc-testnet") {
    const response = await axios.post(
      "https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2",
      {
        query: `{
          pairHourDatas(first: 1, orderBy: hourStartUnix, orderDirection: desc, where: {pair: "0xd10321489beb6d3a83e09fa059cf6c8be5a4c542"}) {
            reserve0
            reserve1
          }
        }`,
      }
    );

    const keyfiData = response.data.data.pairHourDatas[0];

    if (!keyfiData) {
      throw new Error("Didn't find KEYFI token in graphql query result!");
    }
    const keyfiPrice = BigNumber(keyfiData.reserve1)
      .dividedBy(keyfiData.reserve0)
      .toFixed(5);

    return keyfiPrice;
  }

  return new Error(
    `Network ${network.name} (chainId ${network.id}) is not supported`
  );
};
