import { Bech32Address } from '@keplr-wallet/cosmos';
import {
  AccountSetBase,
  ChainStore,
  getKeplrFromWindow,
} from '@keplr-wallet/stores';
import { cmst, comdex, harbor } from '../config/network';
import { CosmjsOfflineSigner, connectSnap, getKey, getSnap, suggestChain } from '@leapwallet/cosmos-snap-provider';
// import { SigningCosmWasmClient } from '@cosmjs/launchpad';

const getCurrencies = (chain) => {
  if (chain?.rpc === comdex?.rpc) {
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

export const getChainConfig = (chain = comdex) => {
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
    currencies: getCurrencies(chain),
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

// export const initializeChain = (type, callback) => {
//   (async () => {
//     let walletType = type || localStorage.getItem("loginType");

//     let isNoExtensionExists =
//       walletType === "keplr"
//         ? !window.getOfflineSigner || !window.keplr
//         : !window?.leap?.getOfflineSigner || !window.leap;

//     if (isNoExtensionExists) {
//       const error = `Please install ${walletType} wallet extension`;
//       callback(error);
//     } else {
//       let suggestChain =
//         walletType === "keplr"
//           ? window.keplr.experimentalSuggestChain
//           : window.leap.experimentalSuggestChain;

//       if (suggestChain) {
//         try {
//           walletType === "keplr"
//             ? await window.keplr.experimentalSuggestChain(getChainConfig())
//             : await window.leap.experimentalSuggestChain(getChainConfig());
//           const offlineSigner =
//             walletType === "keplr"
//               ? window.getOfflineSigner(comdex?.chainId)
//               : window?.leap?.getOfflineSigner(comdex?.chainId);
//           const accounts = await offlineSigner.getAccounts();

//           callback(null, accounts[0]);
//         } catch (error) {
//           callback(error?.message);
//         }
//       } else {
//         const versionError = `Please use the recent version of ${walletType} wallet extension`;
//         callback(versionError);
//       }
//     }
//   })();
// };

export const initializeIBCChain = (config, callback) => {
  (async () => {
    let walletType = localStorage.getItem('loginType');

    if (walletType === "metamask") {
      try {
        const offlineSigner = new CosmjsOfflineSigner(config?.chainId);
        const accounts = await offlineSigner.getAccounts();

        callback(null, accounts[0]);
      } catch (error) {
        callback(error?.message);
      }
    } else {
      let isNoExtensionExists =
        walletType === 'keplr'
          ? !window.getOfflineSigner || !window.keplr
          : !window?.leap?.getOfflineSigner || !window.leap;

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
    }


  })();
};

export const fetchKeplrAccountName = async () => {
  const chainStore = new ChainStore([getChainConfig()]);

  const accountSetBase = new AccountSetBase(
    {
      // No need
      addEventListener: () => { },
      removeEventListener: () => { },
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


export const initializeLeapSnap = (callback) => {
  (async () => {
    // try {
    const snapInstalled = await getSnap();
    console.log(snapInstalled, "snapInstalled");
    if (!snapInstalled) {
      connectSnap(); // Initiates installation if not already present
      await suggestChain(getChainConfig())
    } else {
      const key = await getKey(comdex?.chainId);
      console.log(key, "Key");
      // await suggestChain(getChainConfig())
    }
    //   if (LeapProvider) {
    //     try {
    //       const accounts = await LeapProvider.enable();
    //       console.log(accounts, "accounts[0]");
    //     } catch (error) {
    //       console.error('Error enabling Leap:', error);
    //       callback(error?.message)
    //     }
    //   } else {
    //     console.error('LeapProvider not found. Make sure Leap Metamask Snap is installed.');
    //   }

    //   callback(null, accounts[0])
    // } catch (error) {
    //   callback(error?.message)
    // }



  })()
}

export const initializeChain = (type, callback) => {
  (async () => {
    let walletType = type || localStorage.getItem("loginType");
    if (walletType === "metamask") {
      (async () => {

        getSnap()
          .then(async (res) => {
            if (!res) {
              await connectSnap(); // Initiates installation if not already present
              await suggestChain(getChainConfig());
              const key = await getKey(comdex?.chainId);
              callback(null, key);
            } else {
              const key = await getKey(comdex?.chainId);
              callback(null, key);
            }
          })
          .catch((error) => {
            console.log(error, 'errro');
          });

      })()
    } else {
      let isNoExtensionExists =
        walletType === "keplr"
          ? !window.getOfflineSigner || !window.keplr
          : walletType === "leap"
            ? !window?.leap?.getOfflineSigner || !window.leap
            : true; // Add more conditions for other wallet types if needed

      if (isNoExtensionExists) {
        const error = `Please install ${walletType} wallet extension`;
        callback(error);
      } else {
        let suggestChain =
          walletType === "keplr"
            ? window.keplr.experimentalSuggestChain
            : walletType === "leap"
              ? window.leap.experimentalSuggestChain
              : null; // Add more conditions for other wallet types if needed

        if (suggestChain) {
          try {
            if (walletType === "keplr") {
              await window.keplr.experimentalSuggestChain(getChainConfig());
            } else if (walletType === "leap") {
              await window.leap.experimentalSuggestChain(getChainConfig());
            }
            const offlineSigner =
              walletType === "keplr"
                ? window.getOfflineSigner(comdex?.chainId)
                : walletType === "leap"
                  ? window?.leap?.getOfflineSigner(comdex?.chainId)
                  : null; // Add more conditions for other wallet types if needed

            if (offlineSigner) {
              const accounts = await offlineSigner.getAccounts();
              callback(null, accounts[0]);
            } else {
              callback("Offline signer not found for the selected wallet type.");
            }
          } catch (error) {
            callback(error?.message);
          }
        } else {
          const versionError = `Please use the recent version of ${walletType} wallet extension`;
          callback(versionError);
        }
      }
    }
  })();
};
