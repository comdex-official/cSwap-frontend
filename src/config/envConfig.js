export const envConfig = {
  rpc: "http://46.166.172.252:26657",
  rest: "http://46.166.172.252:1317",
  chainId: "test-1",
  coinDenom: "CMDX",
  coinMinimalDenom: "ucmdx",
  coinDecimals: 6,
  prefix: "comdex",
  coinType: 118,
  chainName: "Comdex Single Server",
  explorerUrlToTx: "https://dev-explorer.comdex.one/transactions/{txHash}",
  apiUrl: "https://testnet-stat.comdex.one",
  comdexStakingUrl: "https://comdex.omniflix.co/stake",
  webSocketApiUrl: "wss://rpc.comdex.one/websocket",

  cSwap: {
    title: "cSwap Exchange",
    websiteUrl: "https://devnet.cswap.one",
    appId: 2,
    masterPoolId: 1,
    networkTag: "Devnet",
  },
};
