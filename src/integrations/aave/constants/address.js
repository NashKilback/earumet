import LendingPoolAddressesProviderABI from "../abi/LendingPoolAddressesProvider.abi.json";
import LendingPoolAbi from "../abi/LendingPool.abi.json";
import { getNetwork, processWeb3OrNetworkArgument } from "../../common";

const mainnet = 1;
const ropsten = 3;
const ethAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const addresses = {
  [mainnet]: {
    LendingPoolAddressesProvider: "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8",
    PriceOracle: "0xA50ba011c48153De246E5192C8f9258A2ba79Ca9",
    reserves: {
      ETH: ethAddress,
      WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      AAVE: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      BAT: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
      BUSD: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      ENJ: "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c",
      KNC: "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
      LEND: "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03",
      LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      MANA: "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
      MKR: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      REN: "0x408e41876cCCDC0F92210600ef50372656052a38",
      REP: "0x1985365e9f78359a9B6AD760e32412f4a445E862",
      SNX: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
      sUSD: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
      TUSD: "0x0000000000085d4780B73119b644AE5ecd22b376",
      UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      YFI: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
      ZRX: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    },
  },
  [ropsten]: {
    LendingPoolAddressesProvider: "0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728",
    reserves: {
      ETH: ethAddress,
      BAT: "0x85B24b3517E3aC7bf72a14516160541A60cFF19d",
      BUSD: "0xFA6adcFf6A90c11f31Bc9bb59eC0a6efB38381C6",
      DAI: "0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108",
      KNC: "0xCe4aA1dE3091033Ba74FA2Ad951f6adc5E5cF361",
      LEND: "0xB47F338EC1e3857BB188E63569aeBAB036EE67c6",
      LINK: "0x1a906E71FF9e28d8E01460639EB8CF0a6f0e2486",
      MANA: "0x78b1F763857C8645E46eAdD9540882905ff32Db7",
      MKR: "0x2eA9df3bABe04451c9C3B06a2c844587c59d9C37",
      REP: "0xBeb13523503d35F9b3708ca577CdCCAdbFB236bD",
      sUSD: "0xc374eB17f665914c714Ac4cdC8AF3a3474228cc5",
      TUSD: "0xa2EA00Df6d8594DBc76b79beFe22db9043b8896F",
      USDC: "0x851dEf71f0e6A903375C1e536Bd9ff1684BAD802",
      USDT: "0xB404c51BBC10dcBE948077F18a4B8E553D160084",
      WBTC: "0xa0E54Ab6AA5f0bf1D62EC3526436F3c05b3348A0",
      ZRX: "0x02d7055704EfF050323A2E5ee4ba05DB2A588959",
    },
  },
};

const isATokenSymbol = (symbol, reserves) =>
  symbol.startsWith("a") && Object.keys(reserves).includes(symbol.slice(1));

const fetchATokenAddress = async (web3, tokenSymbol, reserves) => {
  const lpAddress = await getContractAddress(web3, "LendingPool");
  const lp = new web3.eth.Contract(LendingPoolAbi, lpAddress);

  const reserveAddress = reserves[tokenSymbol.slice(1)];
  const result = await lp.methods.getReserveData(reserveAddress).call();
  return result.aTokenAddress;
};

const fetchContractDynamicAddress = (web3, contractName, networkAddresses) => {
  const addressProviderContract = new web3.eth.Contract(
    LendingPoolAddressesProviderABI,
    networkAddresses["LendingPoolAddressesProvider"]
  );

  switch (contractName) {
    case "LendingPool":
      return addressProviderContract.methods.getLendingPool().call();
    case "LendingPoolCore":
      return addressProviderContract.methods.getLendingPoolCore().call();

    default:
      throw new Error(`Unknown contractName = ${contractName}`);
  }
};

export const isSupportedNetwork = async (web3OrNetwork) => {
  const { chainId } = await processWeb3OrNetworkArgument(web3OrNetwork);
  return Boolean(addresses[chainId]);
};

export const getContractAddress = async (web3, contractName) => {
  const network = await getNetwork(web3);

  if (!(await isSupportedNetwork(network))) {
    throw new Error(
      `Network with chainId=${network.chainId} is not supported!`
    );
  }

  if (contractName === "ETH") {
    return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  }

  const networkAddresses = addresses[network.chainId];
  if (networkAddresses[contractName]) {
    return networkAddresses[contractName];
  }

  if (networkAddresses.reserves[contractName]) {
    return networkAddresses.reserves[contractName];
  }

  let fetchedAddress;

  if (isATokenSymbol(contractName, networkAddresses.reserves)) {
    fetchedAddress = await fetchATokenAddress(
      web3,
      contractName,
      networkAddresses.reserves
    );
  } else {
    fetchedAddress = await fetchContractDynamicAddress(
      web3,
      contractName,
      networkAddresses
    );
  }

  networkAddresses[contractName] = fetchedAddress;
  return fetchedAddress;
};

export async function getReserves(web3, includeWETH = true) {
  const { chainId } = await getNetwork(web3);
  const networkAddresses = addresses[chainId];

  if (!networkAddresses) {
    throw new Error(`Network with chainId=${chainId} is not supported!`);
  }

  if (!includeWETH) {
    delete networkAddresses.reserves.WETH;
  }

  return networkAddresses.reserves;
}
