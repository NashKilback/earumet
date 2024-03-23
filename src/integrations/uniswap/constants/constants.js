import mainnetPairs from "./pairs.json";

const universalRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const universalFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export const contractAddresses = {
  mainnet: {
    Router02: universalRouterAddress,
    Factory: universalFactoryAddress,
  },
  ropsten: {
    Router02: universalRouterAddress,
    Factory: universalFactoryAddress,
    WETH: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    DAI: "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
    LOCK: "0xe8348b237dee32a8e087932cde1786983d91a6e6",
    USDT: "0x516de3a7a567d81737e3a46ec4ff9cfd1fcb0136",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    KEYFI: "0x7C63008B7ed8534215Ff942826499BAcDd18D729",
  },
};

export const uniswapContracts = ["Router02", "Factory"];

// Actual on 2021.11.10
export const availablePairs = {
  mainnet: [...mainnetPairs],
};

export const PAIR_NOT_EXISTS = "PAIR_NOT_EXISTS";
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
