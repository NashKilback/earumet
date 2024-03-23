import ENS from 'ethereum-ens';
import { getWeb3 } from "./web3";

let ensProvider = null;
const getEnsProvider = async () => {
  if (!ensProvider) {
    const web3 = await getWeb3();
    ensProvider = new ENS(web3.currentProvider);
  }

  return ensProvider;
};

export const resolveEns = async (ensAddress) => {
  const ens = await getEnsProvider();
  return ens.resolver(ensAddress).addr();
};
