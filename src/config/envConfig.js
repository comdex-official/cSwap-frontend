export const envConfig = {
  rpc: "http://65.21.176.33:26657",
  rest: "http://65.21.176.33:1317",
  chainId: "test-1",
  coinDenom: "CMDX",
  coinMinimalDenom: "ucmdx",
  coinDecimals: 6,
  prefix: "comdex",
  coinType: 118,
  chainName: "Comdex Test Chain",
  explorerUrlToTx: "https://dev-explorer.comdex.one/transactions/{txHash}",
  apiUrl: "http://65.21.176.33:8000",
  comdexStakingUrl: "https://comdex.omniflix.co/stake",
  webSocketApiUrl: "wss://rpc.comdex.one/websocket",

  cSwap: {
    title: "cSwap Exchange",
    websiteUrl: "https://devnet.cswap.one",
    appId: 2,
    masterPoolId: 2,
    networkTag: "Devnet",
  },
};
