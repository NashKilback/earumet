import BigNumber from "bignumber.js";
import { ERC20Tokens, BEP20Tokens, PolygonTokens } from "../../constants";
import { decimals } from "./constants";

const networkLists = {
  "bsc-mainnet": BEP20Tokens,
  mainnet: ERC20Tokens,
  polygon: PolygonTokens,
};

export const normalizeAmount = (
  network,
  assetSymbol,
  amount,
  reversed = false,
  decimalNumber
) => {
  const currentDecimals = () => {
    if (decimalNumber) return decimalNumber;
    if (decimals[network.name][assetSymbol])
      return decimals[network.name][assetSymbol];

    return networkLists[network.name]
      ? Number(
          networkLists[network.name].find(
            (token) => token.symbol.toLowerCase() === assetSymbol.toLowerCase()
          ).decimals
        )
      : null;
  };

  if (isNaN(currentDecimals())) {
    throw new Error(
      `There is no decimals for currency '${assetSymbol}' on network: ` +
        `chainId=${network.chainId}, name=${network.name}`
    );
  }

  const newAmount = new BigNumber(amount);
  if (reversed) {
    return newAmount.shiftedBy(-currentDecimals()).toFixed();
  }

  return newAmount.shiftedBy(currentDecimals()).integerValue().toFixed();
};

export const denormalizeAmount = (
  network,
  assetSymbol,
  amount,
  decimalNumber
) => normalizeAmount(network, assetSymbol, amount, true, decimalNumber);
