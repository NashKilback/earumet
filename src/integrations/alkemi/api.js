import axios from "axios";
import { getCurrentAccountAddress, getWeb3 } from "../common";

const ALKEMI_URL = "https://api.alkemi.network";

export const getAccount = async (accountAddress, options = {}) => {
  if (!accountAddress) {
    const web3 = options.web3 ? options.web3 : await getWeb3();
    accountAddress = getCurrentAccountAddress(web3);
  }

  const res = await axios.get(`${ALKEMI_URL}/accounts/${accountAddress}`, {
    validateStatus: false,
  });

  if (res.status === 404) {
    return {};
  }

  return res.data;
};

export const getBorrowed = async (accountAddress, options = {}) => {
  if (!accountAddress) {
    const web3 = options.web3 ? options.web3 : await getWeb3();
    accountAddress = getCurrentAccountAddress(web3);
  }
  const account = await getAccount(accountAddress);

  return account.borrow;
};

export const getSupply = async (accountAddress, options = {}) => {
  if (!accountAddress) {
    const web3 = options.web3 ? options.web3 : await getWeb3();
    accountAddress = getCurrentAccountAddress(web3);
  }
  const supplyBalance = {};
  const { supply } = await getAccount(accountAddress);

  if (supply) {
    for (const asset of supply) {
      supplyBalance[asset.symbol] = asset.amountToken;
    }
  }

  return supplyBalance;
};
