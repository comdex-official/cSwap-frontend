export const comdex = {
  chainId: "test-1",
  chainName: "Comdex Test Chain",
  coinDenom: "CMDX",
  coinMinimalDenom: "ucmdx",
  coinDecimals: 6,
  prefix: "comdex",
  rpc: "https://int-rpc.comdex.one",
  rest: "https://int-rest.comdex.one",
  explorerUrlToTx: `https://dev-explorer.comdex.one/transactions/{txHash}`,
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
  uatom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
  uxprt: "ibc/1DA0D68FA3369C706C7FD8F2EDF0F35BD32EB9F02887B050622AE034E93523D0",
  uosmo: "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
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
