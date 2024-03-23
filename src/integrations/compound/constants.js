const contractAddresses = {
  mainnet: {
    PriceFeed: "0x9b8eb8b3d6e2e0db36f41455185fef7049a35cae",
    Maximillion: "0xf859A1AD94BcF445A406B892eF0d3082f4174088",
    CompoundLens: "0xd513d22422a3062Bd342Ae374b4b9c20E0a9a074",
    GovernorAlpha: "0xc0dA01a04C3f3E0be433606045bB7017A7323E38",
    Comptroller: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",
    Reservoir: "0x2775b1c75658Be0F640272CCb8c72ac986009e38",
    UniswapAnchoredView: "0x6D2299C48a8dD07a872FDd0F8233924872Ad1071",
    COMP: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    cBAT: "0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E",
    cCOMP: "0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4",
    cDAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    cETH: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
    cREP: "0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1",
    cSAI: "0xF5DCe57282A584D2746FaF1593d3121Fcac444dC",
    cUNI: "0x35a18000230da775cac24873d00ff85bccded550",
    cUSDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
    cUSDT: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
    cWBTC: "0xC11b1268C1A384e55C48c2391d8d480264A3A7F4",
    cZRX: "0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407",
    BAT: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    REP: "0x1985365e9f78359a9B6AD760e32412f4a445E862",
    SAI: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    ZRX: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
  },
  rinkeby: {
    PriceFeed: "0x5722A3F60fa4F0EC5120DCD6C386289A4758D1b2",
    Maximillion: "0xFBBDBa59516adA2eADf50f96cE0151edC9e0A674",
    CompoundLens: "0x2B833E2D24ac3c246664b986554A7485fDf75D8b",
    GovernorAlpha: "",
    Comptroller: "0x2EAa9D77AE4D8f9cdD9FAAcd44016E746485bddb",
    Reservoir: "",
    COMP: "",
    cBAT: "0xEBf1A11532b93a529b5bC942B4bAA98647913002",
    cDAI: "0x6D7F0754FFeb405d23C51CE938289d4835bE3b14",
    cETH: "0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e",
    cREP: "0xEBe09eB3411D18F4FF8D859e096C533CAC5c6B60",
    cSAI: "",
    cUSDC: "0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1",
    cUSDT: "0x2fB298BDbeF468638AD6653FF8376575ea41e768",
    cWBTC: "0x0014F450B8Ae7708593F4A46F8fa6E5D50620F96",
    cZRX: "0x52201ff1720134bBbBB2f6BC97Bf3715490EC19B",
    BAT: "0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99",
    DAI: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
    REP: "0x6e894660985207feb7cf89Faf048998c71E8EE89",
    SAI: "",
    USDC: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
    USDT: "0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02",
    WBTC: "0x577D296678535e4903D59A4C929B718e1D575e0A",
    ZRX: "0xddea378A6dDC8AfeC82C36E9b0078826bf9e68B6",
  },
  goerli: {
    PriceFeed: "0xd0c84453b3945cd7e84BF7fc53BfFd6718913B71",
    Maximillion: "0x73d3F01b8aC5063f4601C7C45DA5Fdf1b5240C92",
    CompoundLens: "0xE6F46170535FAE86BDbF0Cb033595e060cD99333",
    GovernorAlpha: "",
    Comptroller: "0x627EA49279FD0dE89186A58b8758aD02B6Be2867",
    Reservoir: "",
    COMP: "0xe16C7165C8FeA64069802aE4c4c9C320783f2b6e",
    cBAT: "0xCCaF265E7492c0d9b7C2f0018bf6382Ba7f0148D",
    cDAI: "0x822397d9a55d0fefd20F5c4bCaB33C5F65bd28Eb",
    cETH: "0x20572e4c090f15667cF7378e16FaD2eA0e2f3EfF",
    cREP: "0x1d70B01A2C3e3B2e56FcdcEfe50d5c5d70109a5D",
    cSAI: "0x5D4373F8C1AF21C391aD7eC755762D8dD3CCA809",
    cUSDC: "0xCEC4a43eBB02f9B80916F1c718338169d6d5C1F0",
    cUSDT: "",
    cWBTC: "0x6CE27497A64fFFb5517AA4aeE908b1E7EB63B9fF",
    cZRX: "0xA253295eC2157B8b69C44b2cb35360016DAa25b1",
    BAT: "0x70cBa46d2e933030E2f274AE58c951C800548AeF",
    DAI: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
    REP: "0x183Faf58c4461972765f3F90c6272A4ecE66Bd96",
    SAI: "0x8e9192D6f9d903b1BEb3836F52a9f71E05846e42",
    USDC: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
    USDT: "",
    WBTC: "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05",
    ZRX: "0xe4E81Fa6B16327D4B78CFEB83AAdE04bA7075165",
  },
  kovan: {
    PriceFeed: "0xbBdE93962Ca9fe39537eeA7380550ca6845F8db7",
    Maximillion: "0xC363f83902Ac614F318b04771d21D25aC0d73be5",
    CompoundLens: "0x08CcdB87966C4C7c3Ce7dA8C103c8E14627753D0",
    GovernorAlpha: "0x665a5f09716d63D9256934855b0CE2056a5C4Cf8",
    Comptroller: "0x5eAe89DC1C671724A672ff0630122ee834098657",
    Reservoir: "0x33deD5C4eA51dBC7AF955396839655EFe13E3F1b",
    UniswapAnchoredView: "0xbBdE93962Ca9fe39537eeA7380550ca6845F8db7",
    COMP: "0x61460874a7196d6a22D1eE4922473664b3E95270",
    cBAT: "0x4a77faee9650b09849ff459ea1476eab01606c7a",
    cDAI: "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad",
    cETH: "0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72",
    cREP: "0xA4eC170599a1Cf87240a35b9B1B8Ff823f448b57",
    cSAI: "0xb3f7fb482492f4220833de6d6bfcc81157214bec",
    cUSDC: "0x4a92E71227D294F041BD82dd8f78591B75140d63",
    cUSDT: "0x3f0A0EA2f86baE6362CF9799B523BA06647Da018",
    cWBTC: "0xa1fAA15655B0e7b6B6470ED3d096390e6aD93Abb",
    cZRX: "0xAf45ae737514C8427D373D50Cd979a242eC59e5a",
    BAT: "0x482dC9bB08111CB875109B075A40881E48aE02Cd",
    DAI: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
    REP: "0x50DD65531676F718B018De3dc48F92B53D756996",
    SAI: "0xD1308F63823221518Ec88EB209CBaa1ac182105f",
    USDC: "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede",
    USDT: "0x07de306FF27a2B630B1141956844eB1552B956B5",
    WBTC: "0xd3A691C852CDB01E281545A27064741F0B7f6825",
    ZRX: "0x162c44e53097e7B5aaE939b297ffFD6Bf90D1EE3",
  },
  ropsten: {
    PriceFeed: "0xBEf4E076A995c784be6094a432b9CA99b7431A3f",
    Maximillion: "0xE0a38ab2951B6525C33f20D5E637Ab24DFEF9bcB",
    CompoundLens: "0xB272C5C22850CcEB72C6D45DFBDbDE0D9433b036",
    GovernorAlpha: "0x93ACbA9ecaCeC21BFA09b0C4650Be3596713d747",
    Comptroller: "0xcfa7b0e37f5ac60f3ae25226f5e39ec59ad26152",
    Reservoir: "0x4Aebe384D31e9309BEDf8552232C07591e0cA56F",
    COMP: "0xf76d4a441e4ba86a923ce32b89aff89dbccaa075",
    cCOMP: "0x70014768996439f71c041179ffddce973a83eef2",
    cBAT: "0xaf50a5a6af87418dac1f28f9797ceb3bfb62750a",
    cDAI: "0xbc689667c13fb2a04f09272753760e38a95b998c",
    cETH: "0x859e9d8a4edadfedb5a2ff311243af80f85a91b8",
    cREP: "0x2862065d57749f1576f48ef4393eb81c45fc2d88",
    cSAI: "0x7ac65e0f6dba0ecb8845f17d07bf0776842690f8",
    cUNI: "0x65280b21167bbd059221488b7cbe759f9fb18bb5",
    cUSDC: "0x2973e69b20563bcc66dc63bde153072c33ef37fe",
    cUSDT: "0xf6958cf3127e62d3eb26c79f4f45d3f3b2ccded4",
    cWBTC: "0x541c9cb0e97b77f142684cc33e8ac9ac17b1990f",
    cZRX: "0x6b8b0d7875b4182fb126877023fb93b934dd302a",
    BAT: "0x443Fd8D5766169416aE42B8E050fE9422f628419",
    DAI: "0xc2118d4d90b274016cB7a54c03EF52E6c537D957",
    REP: "0x6FD34013CDD2905d8d27b0aDaD5b97B2345cF2B8",
    SAI: "0x26fF7457496600C63b3E8902C9f871E60eDec4e4",
    USDC: "0x0D9C8723B343A8368BebE0B5E89273fF8D712e3C",
    USDT: "0x516de3a7A567d81737e3a46ec4FF9cFD1fcb0136",
    WBTC: "0xBde8bB00A7eF67007A96945B3a3621177B615C44",
    ZRX: "0xE4C6182EA459E63B8F1be7c428381994CcC2D49c",
  },
};

const cTokens = [
  "cBAT",
  // "cCOMP",
  "cDAI",
  "cETH",
  "cREP",
  "cSAI",
  // "cUNI",
  "cUSDC",
  "cUSDT",
  "cWBTC",
  "cZRX",
];
const supportedAssets = [
  "BAT",
  "COMP",
  "DAI",
  "ETH",
  "REP",
  "SAI",
  "UNI",
  "USDC",
  "USDT",
  "WBTC",
  "ZRX",
];

export { contractAddresses, cTokens, supportedAssets };
