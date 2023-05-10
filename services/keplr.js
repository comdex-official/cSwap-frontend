import { envConfigResult } from '@/config/envConfig';
import { cmst, harbor } from '@/config/network';
import { Bech32Address } from '@keplr-wallet/cosmos';
import {
  AccountSetBase,
  ChainStore,
  getKeplrFromWindow,
} from '@keplr-wallet/stores';

const getCurrencies = async (chain) => {
  const comdex = await envConfigResult();
  if (chain?.rpc === comdex?.envConfig?.rpc) {
    return [
      {
        coinDenom: chain?.coinDenom,
        coinMinimalDenom: chain?.coinMinimalDenom,
        coinDecimals: chain?.coinDecimals,
      },
      {
        coinDenom: cmst?.coinDenom,
        coinMinimalDenom: cmst?.coinMinimalDenom,
        coinDecimals: cmst?.coinDecimals,
      },
      {
        coinDenom: harbor?.coinDenom,
        coinMinimalDenom: harbor?.coinMinimalDenom,
        coinDecimals: harbor?.coinDecimals,
      },
    ];
  } else {
    return [
      {
        coinDenom: chain?.coinDenom,
        coinMinimalDenom: chain?.coinMinimalDenom,
        coinDecimals: chain?.coinDecimals,
      },
    ];
  }
};

export const getChainConfig = async (chain) => {
  const comdex = await envConfigResult();
  chain = comdex?.envConfig;

  return {
    chainId: chain?.chainId,
    chainName: chain?.chainName,
    rpc: chain?.rpc,
    rest: chain?.rest,
    stakeCurrency: {
      coinDenom: chain?.coinDenom,
      coinMinimalDenom: chain?.coinMinimalDenom,
      coinDecimals: chain?.coinDecimals,
    },
    walletUrlForStaking: chain?.walletUrlForStaking,
    bip44: {
      coinType: chain?.coinType,
    },
    bech32Config: Bech32Address.defaultBech32Config(chain?.prefix),
    currencies: await getCurrencies(chain),
    feeCurrencies: [
      {
        coinDenom: chain?.coinDenom,
        coinMinimalDenom: chain?.coinMinimalDenom,
        coinDecimals: chain?.coinDecimals,
        coinGeckoId: chain?.coinGeckoId,
        // Adding separate gas steps for eth accounts.
        gasPriceStep: chain?.features?.includes('eth-address-gen')
          ? {
              low: 1000000000000,
              average: 1500000000000,
              high: 2000000000000,
            }
          : {
              low: 0.01,
              average: 0.025,
              high: 0.04,
            },
      },
    ],
    coinType: chain?.coinType,
    features: chain?.features,
  };
};

export const initializeChain = (type, callback) => {
  (async () => {
    const comdex = await envConfigResult();
    let walletType = type || localStorage.getItem('loginType');

    let isNoExtensionExists =
      walletType === 'keplr'
        ? !window.getOfflineSigner || !window.keplr
        : !window?.leap?.getOfflineSigner || !window.wallet;

    if (isNoExtensionExists) {
      const error = `Please install ${walletType} wallet extension`;
      callback(error);
    } else {
      let suggestChain =
        walletType === 'keplr'
          ? window.keplr.experimentalSuggestChain
          : window.leap.experimentalSuggestChain;

      if (suggestChain) {
        try {
          walletType === 'keplr'
            ? await window.keplr.experimentalSuggestChain(
                await getChainConfig()
              )
            : await window.leap.experimentalSuggestChain(
                await getChainConfig()
              );

          const offlineSigner =
            walletType === 'keplr'
              ? window.getOfflineSigner(comdex?.envConfig?.chainId)
              : window?.leap?.getOfflineSigner(comdex?.envConfig?.chainId);
          const accounts = await offlineSigner.getAccounts();
          callback(null, accounts[0]);
        } catch (error) {
          callback(error?.message);
        }
      } else {
        const versionError = `Please use the recent version of ${walletType} wallet extension`;
        callback(versionError);
      }
    }
  })();
};

export const initializeIBCChain = (config, callback) => {
  (async () => {
    let walletType = localStorage.getItem('loginType');

    let isNoExtensionExists =
      walletType === 'keplr'
        ? !window.getOfflineSigner || !window.keplr
        : !window?.leap?.getOfflineSigner || !window.wallet;

    if (isNoExtensionExists) {
      const error = `Please install ${walletType} wallet extension`;
      callback(error);
    } else {
      let suggestChain =
        walletType === 'keplr'
          ? window.keplr.experimentalSuggestChain
          : window.leap.experimentalSuggestChain;

      if (suggestChain) {
        try {
          walletType === 'keplr'
            ? await window.keplr.experimentalSuggestChain(config)
            : await window.leap.experimentalSuggestChain(config);
          const offlineSigner =
            walletType === 'keplr'
              ? window.getOfflineSigner(config?.chainId)
              : window?.leap?.getOfflineSigner(config?.chainId);
          const accounts = await offlineSigner.getAccounts();

          callback(null, accounts[0]);
        } catch (error) {
          callback(error?.message);
        }
      } else {
        const versionError = 'Please use the recent version of keplr extension';
        callback(versionError);
      }
    }
  })();
};

export const fetchKeplrAccountName = async () => {
  const chainStore = new ChainStore([await getChainConfig()]);
  const comdex = await envConfigResult();
  const accountSetBase = new AccountSetBase(
    {
      // No need
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    chainStore,
    comdex?.envConfig?.chainId,
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
