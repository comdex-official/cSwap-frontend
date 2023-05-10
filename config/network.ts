import { ibcAssets } from './ibc_assets';

const getIbcDenomsMap = async () => {
  let myMap: any = {};
  const AssetList: any = await ibcAssets();
  for (let i = 0; i < AssetList?.tokens?.length; i++) {
    if (myMap[AssetList?.tokens[i].coinMinimDenom] === undefined) {
      myMap[AssetList?.tokens[i].coinMinimalDenom] =
        AssetList?.tokens[i]?.ibcDenomHash;
    }
  }

  return myMap;
};

export const cmst = {
  coinDenom: 'CMST',
  coinMinimalDenom: 'ucmst',
  coinDecimals: 6,
  symbol: 'CMST',
};

export const harbor = {
  coinDenom: 'HARBOR',
  coinMinimalDenom: 'uharbor',
  coinDecimals: 6,
  symbol: 'HARBOR',
};

export const ibcDenoms: any = getIbcDenomsMap() || {};

export const tokenCoinGeckoIds = [
  'cosmos',
  'terra-luna',
  'ki',
  'comdex',
  'kava',
  'sentinel',
  'osmosis',
  'juno-network',
  'akash-network',
  'umee',
  'mantle',
  'persistence',
  'chihuahua-token',
  'secret',
  'injective-protocol',
];
