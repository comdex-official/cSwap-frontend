export const embedChainInfo = [
  {
    rpc: "https://devnet.cswap.one/vega",
    rest: "https://devnet.cswap.one/vega-rest",
    chainId: "theta-testnet-001",
    chainName: "Cosmos Hub Test",
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
      coinImageUrl: window.location.origin + "/public/assets/tokens/cosmos.svg",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: `cosmospub`,
      bech32PrefixValAddr: `cosmosvaloper`,
      bech32PrefixValPub: `cosmosvaloperpub`,
      bech32PrefixConsAddr: `cosmosvalcons`,
      bech32PrefixConsPub: `cosmosvalconspub`,
    },
    currencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          window.location.origin + "/public/assets/tokens/cosmos.svg",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          window.location.origin + "/public/assets/tokens/cosmos.svg",
      },
    ],
    coinType: 118,
    features: ["ibc-transfer"],
    explorerUrlToTx: "https://meteor-explorer.comdex.one/transactions/{txHash}",
  },
  {
    rpc: "https://rpc.testnet.persistence.one",
    rest: "https://rest.testnet.persistence.one",
    chainId: "test-core-1",
    chainName: "Persistence-test",
    stakeCurrency: {
      coinDenom: "XPRT",
      coinMinimalDenom: "uxprt",
      coinDecimals: 6,
      coinGeckoId: "persistence",
      coinImageUrl: window.location.origin + "/public/assets/tokens/xprt.png",
    },
    bip44: {
      coinType: 750,
    },
    bech32Config: {
      bech32PrefixAccAddr: "persistence",
      bech32PrefixAccPub: `persistencepub`,
      bech32PrefixValAddr: `persistencevaloper`,
      bech32PrefixValPub: `persistencevaloperpub`,
      bech32PrefixConsAddr: `persistencevalcons`,
      bech32PrefixConsPub: `persistencevalconspub`,
    },
    currencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
        coinImageUrl: window.location.origin + "/public/assets/tokens/xprt.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
        coinImageUrl: window.location.origin + "/public/assets/tokens/xprt.png",
      },
    ],
    features: ["ibc-transfer"],
    explorerUrlToTx:
      "https://test-core-1.explorer.persistence.one/transactions/{txHash}",
  },
  {
    rpc: "https://osmot.rpc.comdex.one",
    rest: "https://osmot.rest.comdex.one",
    chainId: "osmo-test-4",
    chainName: "Osmosis-Test",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
      coinImageUrl:
        window.location.origin + "/public/assets/tokens/osmosis.svg",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: `osmopub`,
      bech32PrefixValAddr: `osmovaloper`,
      bech32PrefixValPub: `osmovaloperpub`,
      bech32PrefixConsAddr: `osmovalcons`,
      bech32PrefixConsPub: `osmovalconspub`,
    },
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          window.location.origin + "/public/assets/tokens/osmosis.svg",
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "ion",
        coinImageUrl: window.location.origin + "/public/assets/tokens/ion.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          window.location.origin + "/public/assets/tokens/osmosis.svg",
      },
    ],
    features: ["ibc-transfer"],
    explorerUrlToTx:
      "https://bigdipper.testnet.osmo.mp20.net/transactions/{txHash}",
  },
];
