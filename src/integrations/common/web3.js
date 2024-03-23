import WalletConnectProvider from "@walletconnect/web3-provider";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { networkNames } from "./constants";
import Erc20Abi from "./erc20.abi.json";
import { WalletProviderId } from "../../constants";
import { loadMetamaskEvents, loadWalletConnectEvents } from "./web3Events";
import { isMobile } from "../../utils";
import { formatTxConfig, getFees } from ".";

export const createWeb3InNodeJS = () => {
  const ethereumNodeUrl = process.env.ETHEREUM_HTTP_PROVIDER;
  if (!ethereumNodeUrl) {
    throw new Error("ETHEREUM_HTTP_PROVIDER is not specified!");
  }

  const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("ETHEREUM_PRIVATE_KEY is not specified!");
  }

  const web3 = new Web3(ethereumNodeUrl);
  const account = web3.eth.accounts.wallet.add(privateKey);
  web3.eth.defaultAccount = account.address;

  return web3;
};

export async function createInfuraWeb3() {
  const infuraKey = process.env.REACT_APP_INFURA_KEY;
  if (!infuraKey) {
    throw new Error("REACT_APP_INFURA_KEY is not specified!");
  }

  const infuraUrl = `https://mainnet.infura.io/v3/${infuraKey}`;
  return new Web3(infuraUrl);
}

export async function createMetamaskWeb3() {
  if (!window.ethereum) {
    throw new Error("There is no 'window.ethereum'. Do you have MetaMask?");
  }

  const web3 = new Web3(window.ethereum);

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  web3.eth.defaultAccount = accounts[0];

  loadMetamaskEvents();

  return web3;
}

export async function createWalletConnectWeb3() {
  const provider = new WalletConnectProvider({
    infuraId: process.env.REACT_APP_INFURA_KEY,
  });

  // provider.disconnect();

  // It will launch the wallet connect QR Code modal
  await provider.enable();

  const web3 = new Web3(provider);
  web3.eth.defaultAccount = provider.accounts[0];

  window.send = (e, t) => {
    return provider.send(e, t);
  };

  loadWalletConnectEvents(provider);

  return web3;
}

function goToSelfkey(params, protocol = "selfkey") {
  const anchor = document.createElement("a");
  anchor.href = `${protocol}://${params}`;
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
}

function getSelfkeyDeeplink() {
  let protocol = "selfkey";

  if (isMobile()) {
    return `${protocol}://wc`;
  }

  if (process.env.NODE_ENV === "development") {
    protocol += "-dev";
  }

  return `${protocol}://wallet-connect`;
}

async function creatSelfKeyWeb3() {
  if (!isMobile()) {
    localStorage.setItem("walletconnect", null);
  }
  const provider = new WalletConnectProvider({
    infuraId: process.env.REACT_APP_INFURA_KEY,
    qrcode: false,
  });

  provider.connector.on("display_uri", (err, payload) => {
    const uri = payload.params[0];
    if (isMobile()) {
      goToSelfkey(`wc?uri=${uri}`);
    } else {
      goToSelfkey(
        `wallet-connect/${uri}`,
        `selfkey${process.env.NODE_ENV === "development" ? "-dev" : ""}`
      );
    }
  });

  localStorage.setItem(
    "WALLETCONNECT_DEEPLINK_CHOICE",
    JSON.stringify({
      name: "SelfKey",
      href: getSelfkeyDeeplink(),
    })
  );
  await provider.enable();

  if (!isMobile()) {
    const web3 = new Web3(provider);
    web3.eth.defaultAccount = provider.accounts[0];
    window.send = (e, t) => {
      return provider.send(e, t);
    };
    loadWalletConnectEvents(provider, provider.accounts[0]);
    return web3;
  }
  return new Promise((resolve) => {
    let interval = setInterval(() => {
      if (provider.connected) {
        clearInterval(interval);
        const web3 = new Web3(provider);
        web3.eth.defaultAccount = provider.accounts[0];

        window.send = (e, t) => {
          return provider.send(e, t);
        };

        loadWalletConnectEvents(provider, provider.accounts[0]);

        resolve(web3);
      }
    }, 1000);
  });
}

export const createWeb3InBrowser = (providerId) => {
  if (providerId === WalletProviderId.Infura) {
    return createInfuraWeb3();
  }

  if (providerId === WalletProviderId.Metamask) {
    return createMetamaskWeb3();
  }

  if (providerId === WalletProviderId.SelfKey) {
    return creatSelfKeyWeb3();
  }

  if (providerId === WalletProviderId.WalletConnect) {
    return createWalletConnectWeb3();
  }

  throw new Error(`Wallet provider ${providerId} not supported`);
};

let _web3 = null;
let _providerId = null;
let _providerLibrary = null;
export const getWeb3 = async (providerId, init, library, account) => {
  if (library || _providerLibrary) {
    if (library) {
      library.eth.defaultAccount = account;
      _providerLibrary = library;
    }
    return _providerLibrary;
  } else {
    if (_web3) {
      if (!providerId || (providerId && providerId === _providerId)) {
        return _web3;
      }
    }
    // prevent repeat requests to desktop wallet
    if (init && providerId === WalletProviderId.SelfKey && !isMobile()) {
      return;
    }

    _providerId = providerId;

    if (typeof window === "undefined") {
      _web3 = createWeb3InNodeJS();
    } else {
      _web3 = await createWeb3InBrowser(providerId);
    }

    return _web3;
  }
};

export const resetWeb3 = () => {
  _web3 = null;
  _providerLibrary = null;
  resetNetwork();
};

export const approveErc20IfNeeded = async (
  web3,
  assetAddress,
  receiver,
  amount,
  trxOverrides,
  options = {}
) => {
  const erc20Contract = new web3.eth.Contract(Erc20Abi, assetAddress);

  const allowance = new BigNumber(
    await erc20Contract.methods
      .allowance(getCurrentAccountAddress(web3), receiver)
      .call()
  );

  const notEnough = allowance.lt(amount);

  const { pendingCallbackParams } = options;

  if (notEnough) {
    const fees = await getFees(web3, 20);
    const network = await getNetwork(web3);
    const txConfig = formatTxConfig(network.chainId, fees, trxOverrides);

    return erc20Contract.methods.approve(receiver, amount).send(
      {
        from: getCurrentAccountAddress(web3),
        ...txConfig,
        ...trxOverrides,
      },
      pendingCallbackParams
        ? getPendingTrxCallback(pendingCallbackParams.callback, {
            platform: pendingCallbackParams.platform,
            type: "approve",
            assets: pendingCallbackParams.assets,
          })
        : // We need to provide any function as callback or web3 will fail with:
          // Error: "No 'from' address specified..."
          () => {}
    );
  }
};

let _network = null;

export const getNetwork = async (web3) => {
  if (!web3) {
    web3 = await getWeb3();
  }

  const chainId = await web3.eth.getChainId();

  let name = networkNames[chainId];
  if (!name) {
    name = "unknown";
  }

  _network = { chainId, name };

  if (_providerId === WalletProviderId.Metamask) {
    window.ethereum.once("chainChanged", () => {
      resetNetwork();
    });
  }

  return _network;
};

export const resetNetwork = () => {
  _network = null;
};

export const getTrxOverrides = (options) => {
  const overrides = {};
  if (options.gasPrice !== undefined) overrides.gasPrice = options.gasPrice;
  if (options.nonce !== undefined) overrides.nonce = options.nonce;
  if (options.gas !== undefined) overrides.gas = options.gas;
  return overrides;
};

export const promisifyBatchRequest = (batch, requestFn, params = {}) => {
  return new Promise((resolve, reject) => {
    const req = requestFn(params, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
    batch.add(req);
  });
};

export const REQUEST_TYPE_CALL = "call";
export const REQUEST_TYPE_SEND = "send";

export const web3BatchRequest = (
  web3,
  method,
  reqType,
  methodParamsArray,
  requestParamsArray = null,
  catchFunction = null
) => {
  if (![REQUEST_TYPE_CALL, REQUEST_TYPE_SEND].includes(reqType)) {
    throw new Error(`Wrong type of request: '${reqType}'`);
  }

  const batch = new web3.BatchRequest();

  const promises = methodParamsArray.map((params, index) => {
    return promisifyBatchRequest(
      batch,
      method(...params)[reqType].request,
      requestParamsArray ? requestParamsArray[index] : undefined
    );
  });

  batch.execute();
  return Promise.all(
    catchFunction ? promises.map((p) => p.catch(catchFunction)) : promises
  );
};

export const getCurrentAccountAddress = (web3) => web3.eth.defaultAccount;

export const getPendingTrxCallback = (callback, trxProperties) => {
  if (!callback) {
    // We need to provide any function as callback or web3 will fail with:
    // Error: "No 'from' address specified..."
    return () => {};
  }

  return (error, trxHash) => {
    if (!error) {
      callback({
        ...trxProperties,
        hash: trxHash,
      });
    }
  };
};
