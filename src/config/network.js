import AssetList from "../config/ibc_assets.json";

const getIbcDenomsMap = () => {
  let myMap = {};

  for (let i = 0; i < AssetList?.tokens?.length; i++) {
    if (myMap[AssetList?.tokens[i].coinMinimDenom] === undefined) {
      myMap[AssetList?.tokens[i].coinMinimalDenom] =
        AssetList?.tokens[i]?.ibcDenomHash;
    }
  }

  return myMap;
};

export const comdex = {
  chainId: "comdex-1",
  chainName: process.env.REACT_APP_CHAIN_NAME,
  rpc: "https://rpc.comdex.one",
  rest: "https://rest.comdex.one",
  explorerUrlToTx: process.env.REACT_APP_EXPLORER_URL_TO_TX,
  walletUrlForStaking: process.env.REACT_APP_COMDEX_STAKING_URL,
  networkTag: process.env.REACT_APP_NETWORK_TAG,
  coinDenom: "CMDX",
  coinMinimalDenom: "ucmdx",
  coinDecimals: 6,
  prefix: "comdex",
  coinType: 118,
};

export const cmst = {
  coinDenom: "CMST",
  coinMinimalDenom: "ucmst",
  coinDecimals: 6,
};

export const harbor = {
  coinDenom: "HARBOR",
  coinMinimalDenom: "uharbor",
  coinDecimals: 6,
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
