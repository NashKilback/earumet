export const marketId = {
  WETH: "0",
  SAI: "1",
  USDC: "2",
  DAI: "3",

  // This market number does not exist on the protocol,
  // but can be used for standard actions
  ETH: "-1",
};

export const accountNumbers = {
  SPOT: "78249916358380492593314239409032173911741268194868200833150293576330928686520",
  MARGIN: "0",
};

export const actionType = {
  Deposit: 0,
  Withdraw: 1,
};

export const supportedAssets = ["ETH", "DAI", "USDC"];

export const contractAddresses = {
  mainnet: {
    SoloMargin: "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e",
    PayableSoloMargin: "0xa8b39829cE2246f89B31C013b8Cde15506Fb9A76",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
};
