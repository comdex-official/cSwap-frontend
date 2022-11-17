export const comdex = {
  chainId: process.env.REACT_APP_CHAIN_ID,
  chainName: process.env.REACT_APP_CHAIN_NAME,
  rpc: process.env.REACT_APP_RPC,
  rest: process.env.REACT_APP_REST,
  explorerUrlToTx: process.env.REACT_APP_EXPLORER_URL_TO_TX,
  walletUrlForStaking: process.env.REACT_APP_COMDEX_STAKING_URL,
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

export const ibcDenoms = {
  uatom: process.env.REACT_APP_ATOM_IBC_DENOM,
  uosmo: process.env.REACT_APP_OSMO_IBC_DENOM,
  uusdc: process.env.REACT_APP_USDC_IBC_DENOM,
  "weth-wei": process.env.REACT_APP_WETH_IBC_DENOM,
};

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
