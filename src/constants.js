import ETHList1 from "./tokenLists/tokensListETH1.json";
import ETHList2 from "./tokenLists/tokensListETH2.json";
import ETHList3 from "./tokenLists/tokensListETH3.json";

import BEP20List1 from "./tokenLists/tokensListBSC1.json";
import BEP20List2 from "./tokenLists/tokensListBSC2.json";

import PolygonList from "./tokenLists/tokensListPolygon.json";

export const WalletProviderId = {
  Infura: "Infura",
  Metamask: "Metamask",
  Coinbase: "Coinbase",
  WalletConnect: "WalletConnect",
  SelfKey: "SelfKey",
};

export const ERC20Tokens = [
  ...ETHList1.tokens,
  ...ETHList2.tokens,
  ...ETHList3.tokens,
];

export const BEP20Tokens = [...BEP20List1.tokens, ...BEP20List2.tokens];

export const PolygonTokens = [...PolygonList.tokens];
