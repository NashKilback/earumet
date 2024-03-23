import whitelistAbi from "./whitelist.abi.json";
import {
  getCurrentAccountAddress,
  getNetwork,
  getWeb3,
  processWeb3OrNetworkArgument
} from "../common";

const whitelistAddresses = {
  "mainnet": "0xc3faa8e87cD7b3678FA10C0F9638Eb4BA7DA20C5",
  "ropsten": "0xa40fC5a9232868B0b681B9C34F3081be32368ad3",
};

export const isSupportedNetwork = async (web3OrNetwork) => {
  const network = await processWeb3OrNetworkArgument(web3OrNetwork);
  return Boolean(whitelistAddresses[network.name]);
};

const getWhitelistAddress = async (web3) => {
  const network = await getNetwork(web3);

  const address = whitelistAddresses[network.name];
  if (!address) {
    throw new Error(`Network with chainId=${network.chainId} is not supported!`);
  }

  return address;
};

export const isWhitelisted = async (address = null) => {
  const web3 = await getWeb3();

  if (!address) {
    address = getCurrentAccountAddress(web3);
  }

  const contractAddress = await getWhitelistAddress(web3);
  const contract = new web3.eth.Contract(whitelistAbi, contractAddress);
  return contract.methods.isWhitelisted(address).call();
};