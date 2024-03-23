const contractAddresses = {
  "mainnet": {
    "1inch-exchange": "0x111111125434b319222cdbf8c261674adb56f3ae",
    "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "BAT": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    "CHAI": "0x06AF07097C9Eeb7fD685c692751D5C66dB49c215",
    "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "TUSD": "0x0000000000085d4780B73119b644AE5ecd22b376",
    "BUSD": "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    "sUSD": "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
    "PAX": "0x8E870D67F660D95d5be530380D0eC0bd388289E1",
    "renBTC": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
    "WBTC": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    "TBTC": "0x1bBE271d15Bb64dF0bc6CD28Df9Ff322F2eBD847",
    "HBTC": "0x0316EB71485b0Ab14103307bf65a021042c6d380",
    "sBTC": "0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6",
  },
};

const supportedAssets = [
  "ETH",
  "WETH",
  "CHAI",
  "DAI",
  "USDC",
  "USDT",
  "TUSD",
  "BUSD",
  "sUSD",
  "PAX",
  "renBTC",
  "WBTC",
  "TBTC",
  "HBTC",
  "sBTC",
];

export {
  contractAddresses,
  supportedAssets,
};