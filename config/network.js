import { envConfig } from "./envConfig.js";
import { ibcAssets } from "./ibc_asset_api.js";

const getIbcDenomsMap = () => {
  let myMap = {};
  ibcAssets()
    .then((result) => {
      for (let i = 0; i < result?.tokens?.length; i++) {
        if (myMap[result?.tokens[i].ibcDenomHash] === undefined) {
          myMap[result?.tokens[i].ibcDenomHash] = result?.tokens[i]?.symbol;
        }
      }
    })
    .catch((error) => {
      console.log(error, "error in assetList Api");
    });

  return myMap;
};

export const comdex = {
  chainId: envConfig?.chainId,
  chainName: envConfig?.chainName,
  rpc: envConfig?.rpc,
  rest: envConfig?.rest,
  explorerUrlToTx: envConfig?.explorerUrlToTx,
  walletUrlForStaking: envConfig?.walletUrlForStaking,
  coinDenom: envConfig?.coinDenom,
  coinMinimalDenom: envConfig?.coinMinimalDenom,
  coinDecimals: envConfig?.coinDecimals,
  prefix: envConfig?.prefix,
  coinType: envConfig?.coinType,
  symbol: envConfig?.symbol,
  webSocketApiUrl: envConfig?.webSocketApiUrl,
};

export const cmst = {
  coinDenom: "CMST",
  coinMinimalDenom: "ucmst",
  coinDecimals: 6,
  symbol: "CMST",
};

export const harbor = {
  coinDenom: "HARBOR",
  coinMinimalDenom: "uharbor",
  coinDecimals: 6,
  symbol: "HARBOR",
};

export const ibcDenoms = getIbcDenomsMap() || {};

export const tokenCoinGeckoIds = [
  "cosmos",
  "terra-luna",
  "ki",
  "comdex",
  "kava",
  "sentinel",
  "osmosis",
  "juno-network",
  "akash-network",
  "umee",
  "mantle",
  "persistence",
  "chihuahua-token",
  "secret",
  "injective-protocol",
];
