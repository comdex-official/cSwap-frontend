import AssetList from "../config/ibc_assets.json";

export const ibcAssetsInfo = AssetList?.tokens?.map((token) => {
  return {
    counterpartyChainId: token?.chainId,
    sourceChannelId: token?.comdexChannel,
    destChannelId: token?.channel,
    coinMinimalDenom: token?.coinMinimalDenom,
    ibcDenomHash: token?.ibcDenomHash,
  };
});
