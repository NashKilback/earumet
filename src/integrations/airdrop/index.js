import airdropAbi from './airdrop.abi.json';
import {
  getCurrentAccountAddress,
  getNetwork,
  getPendingTrxCallback,
  getTrxOverrides,
  getWeb3,
} from '../common';

const GAS_LIMIT = 100000;
const PENDING_CALLBACK_PLATFORM = 'airdrop';
const TOKEN_CLAIM_SYMBOL = 'KEY';
const TOKEN_CLAIM_AMOUNT = 18888;

const airdropAddresses = {
  'mainnet': '0xc4bdbcF0b6593039617999f266765dF1DE2564Bb',
  'ropsten': '0xA4be3CE891a52D06C745b5506d1d23ba3Af21fDA',
};

const getAirdropAddress = async (web3) => {
  const network = await getNetwork(web3);

  const address = airdropAddresses[network.name];
  if (!address) {
    throw new Error(`Network with chainId=${network.chainId} is not supported!`);
  }

  return address;
};

const getAirdropContract = async (web3) => {
  const contractAddress = await getAirdropAddress(web3);
  return new web3.eth.Contract(airdropAbi, contractAddress);
};

export const claim = async (options = {}) => {
  const web3 = await getWeb3();
  const airdrop = await getAirdropContract(web3);
  const trxOverrides = getTrxOverrides(options);
  return airdrop.methods.claim().send(
    {
      from: getCurrentAccountAddress(web3),
      gas: GAS_LIMIT,
      ...trxOverrides,
    },
    getPendingTrxCallback(options.pendingCallback, {
      platform: PENDING_CALLBACK_PLATFORM,
      type: 'claim',
      assets: [{
        symbol: TOKEN_CLAIM_SYMBOL,
        amount: TOKEN_CLAIM_AMOUNT,
      }],
    }),
  );
};

export const airdropsLeft = async () => {
  const web3 = await getWeb3();
  const airdrop = await getAirdropContract(web3);
  return airdrop.methods.airdropsLeft().call();
};
