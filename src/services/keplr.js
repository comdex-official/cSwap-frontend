import { comdex } from "../config/network";import {
  ChainStore,
  getKeplrFromWindow,
  AccountSetBase,
} from "@keplr-wallet/stores";

export const getChainConfig = () => {
  return {
    chainId: comdex?.chainId,
    chainName: comdex?.chainName,
    rpc: comdex?.rpc,
    rest: comdex?.rest,
    stakeCurrency: {
      coinDenom: comdex?.coinDenom,
      coinMinimalDenom: comdex?.coinMinimalDenom,
      coinDecimals: comdex?.coinDecimals,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: `${comdex?.prefix}`,
      bech32PrefixAccPub: `${comdex?.prefix}pub`,
      bech32PrefixValAddr: `${comdex?.prefix}valoper`,
      bech32PrefixValPub: `${comdex?.prefix}valoperpub`,
      bech32PrefixConsAddr: `${comdex?.prefix}valcons`,
      bech32PrefixConsPub: `${comdex?.prefix}valconspub`,
    },
    currencies: [
      {
        coinDenom: comdex?.coinDenom,
        coinMinimalDenom: comdex?.coinMinimalDenom,
        coinDecimals: comdex?.coinDecimals,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: comdex?.coinDenom,
        coinMinimalDenom: comdex?.coinMinimalDenom,
        coinDecimals: comdex?.coinDecimals,
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
  };
};

export const initializeChain = (callback) => {
  (async () => {
    if (!window.getOfflineSigner || !window.keplr) {
      const error = "Please install keplr extension";
      callback(error);
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          await window.keplr.experimentalSuggestChain(getChainConfig());
          const offlineSigner = window.getOfflineSigner(comdex?.chainId);
          const accounts = await offlineSigner.getAccounts();

          callback(null, accounts[0]);
        } catch (error) {
          callback(error?.message);
        }
      } else {
        const versionError = "Please use the recent version of keplr extension";
        callback(versionError);
      }
    }
  })();
};

export const initializeIBCChain = (config, callback) => {
  (async () => {
    if (!window.getOfflineSigner || !window.keplr) {
      const error = "Please install keplr extension";

      callback(error);
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          await window.keplr.experimentalSuggestChain(config);
          const offlineSigner = window.getOfflineSigner(config?.chainId);
          const accounts = await offlineSigner.getAccounts();
          callback(null, accounts[0]);
        } catch (error) {
          callback(error?.message);
        }
      } else {
        const versionError = "Please use the recent version of keplr extension";
        callback(versionError);
      }
    }
  })();
};

export const fetchKeplrAccountName = async () => {
  const chainStore = new ChainStore([getChainConfig()]);

  const accountSetBase = new AccountSetBase(
    {
      // No need
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    chainStore,
    comdex?.chainId,
    {
      suggestChain: false,
      autoInit: true,
      getKeplr: getKeplrFromWindow,
    }
  );

   // Need wait some time to get the Keplr.
   await (() => {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  })();

  return accountSetBase?.name;
};