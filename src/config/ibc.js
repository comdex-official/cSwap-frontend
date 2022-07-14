import { ibcDenoms } from "./network";

export const ibcAssetsInfo = [
  {
    counterpartyChainId: "theta-testnet-001",
    //cosmos
    sourceChannelId: "channel-0",
    destChannelId: "channel-403",
    coinMinimalDenom: "uatom",
    ibcDenomHash: ibcDenoms["uatom"],
  },
  {
    counterpartyChainId: "test-core-1",
    sourceChannelId: "channel-1",
    destChannelId: "channel-74",
    coinMinimalDenom: "uxprt",
    ibcDenomHash: ibcDenoms["uxprt"],
  },
  {
    counterpartyChainId: "osmo-test-4",
    sourceChannelId: "channel-1",
    destChannelId: "channel-346",
    coinMinimalDenom: "uosmo",
    ibcDenomHash: ibcDenoms["uosmo"],
  },
];
