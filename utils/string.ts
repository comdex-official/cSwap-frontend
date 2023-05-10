import { ibcDenoms } from '@/config/network';
import { sha256, stringToPath } from '@cosmjs/crypto';
import { getExponent } from './number';
import React from 'react';
import { envConfigResult } from '@/config/envConfig';
import { ibcAssets } from '@/config/ibc_assets';

const getIbcDenomToDenomMap = () => {
  let myMap: any = {};
  const AssetList: any = ibcAssets();
  for (let i = 0; i < AssetList?.tokens?.length; i++) {
    if (myMap[AssetList?.tokens[i].ibcDenomHash] === undefined) {
      myMap[AssetList?.tokens[i].ibcDenomHash] =
        AssetList?.tokens[i]?.coinMinimalDenom;
    }
  }

  return myMap;
};

let ibcDenomToDenomMap = getIbcDenomToDenomMap();

const encoding = require('@cosmjs/encoding');

export const decode = (hash: any) =>
  decodeURIComponent(hash.replace('#', '')) || undefined;

export const generateHash = (txBytes: any) =>
  encoding.toHex(sha256(txBytes)).toUpperCase();

export const ibcDenomToDenom = (key: any) => ibcDenomToDenomMap?.[key];

const iconMap = {
  ucmdx: 'comdex-icon',
  ucmst: 'cmst-icon',
  uharbor: 'harbor-icon',
  // taking coinMinimalDenom to match ibc denom and fetch icon.
  [ibcDenoms['uatom']]: 'atom-icon',
  [ibcDenoms['uosmo']]: 'osmosis-icon',
  [ibcDenoms['uusdc']]: 'usdc-icon',
  [ibcDenoms['weth-wei']]: 'weth-icon',
  [ibcDenoms['ujuno']]: 'juno-icon',
  [ibcDenoms['wbtc-satoshi']]: 'wbtc-icon',
  [ibcDenoms['stuatom']]: 'statom-icon',
  [ibcDenoms['wmatic-wei']]: 'wmatic-icon',
  [ibcDenoms['dai-wei']]: 'dai-icon',
  [ibcDenoms['aevmos']]: 'evmos-icon',
  [ibcDenoms['wbnb-wei']]: 'wbnb-icon',
  'weth-wei': 'weth-icon', // remove: this before pushing to devnet/testnet only for testing
  [ibcDenoms['uluna']]: 'luna2-icon',
  [ibcDenoms['acanto']]: 'canto-icon',
  [ibcDenoms['uakt']]: 'akt-icon',
  [ibcDenoms['uxprt']]: 'xprt-icon',
  [ibcDenoms['stuosmo']]: 'stosmo-icon',
  [ibcDenoms['wftm-wei']]: 'wfmt-icon',
  [ibcDenoms['umntl']]: 'mntl-icon',
  [ibcDenoms['shib-wei']]: 'shib-icon',
  [ibcDenoms['uhuahua']]: 'huahua-icon',
  [ibcDenoms['gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48']]:
    'gusdc-icon',
  [ibcDenoms['stkATOM']]: 'stkatom-icon',
  [ibcDenoms['gravity0x6B175474E89094C44Da98b954EedeAC495271d0F']]: 'gdai-icon',
  [ibcDenoms['stujuno']]: 'stujuno-icon',
  [ibcDenoms['stuluna']]: 'stuluna-icon',
  [ibcDenoms['stevmos']]: 'stevmos-icon',
};

export const iconNameFromDenom = (denom: any) => {
  if (denom) {
    return iconMap[denom];
  }
};

export const orderStatusText = (key: any) => {
  switch (key) {
    case 0:
      return 'UNSPECIFIED';
    case 1:
      return 'NOT EXECUTED';
    case 2:
      return 'NOT MATCHED';
    case 3:
      return 'PARTIALLY MATCHED';
    case 4:
      return 'COMPLETED';
    case 5:
      return 'CANCELED';
    case 6:
      return 'EXPIRED';
    default:
      return '';
  }
};

export const trimWhiteSpaces = (data: any) => data.split(' ').join('');

export const truncateString = (string: any, front: any, back: any) => {
  if (typeof string === 'string') {
    return `${string?.substr(0, front)}...${string?.substr(
      string?.length - back,
      string?.length
    )}`;
  }
};

export const lowercaseFirstLetter = (string: any) => {
  return string.charAt(0).toLowerCase() + string.slice(1).toUpperCase();
};

//Considering input with given decimal point only.
export const toDecimals = async (value: any, decimal?: any) => {
  const comdex = await envConfigResult();
  return value.indexOf('.') >= 0
    ? value.substr(0, value.indexOf('.')) +
        value.substr(
          value.indexOf('.'),
          Number(decimal)
            ? Number(getExponent(decimal)) + 1
            : comdex?.envConfig?.coinDecimals + 1 //  characters from start to end (exclusive), so adding extra 1
        )
    : value;
};

export const uniqueDenoms = (list: any, type: any) => {
  return [
    //@ts-ignore
    ...new Set(
      list && list.length > 0
        ? list.map((item: any) =>
            type === 'in' ? item.denomIn : item.denomOut
          )
        : []
    ),
  ];
};

export const uniqueLiquidityPairDenoms = (list: any, type: any) => {
  return [
    //@ts-ignore
    ...new Set(
      list && list.length > 0
        ? list.map((item: any) =>
            type === 'in' ? item.baseCoinDenom : item.quoteCoinDenom
          )
        : []
    ),
  ];
};

export const uniqueQuoteDenomsForBase = (list: any, type: any, denom: any) => {
  const quoteList =
    list && list.length > 0
      ? list.filter((item: any) =>
          type === 'in'
            ? item.baseCoinDenom === denom
            : item.quoteCoinDenom === denom
        )
      : [];

  const quoteMap = quoteList.map((item: any) =>
    type === 'in' ? item.quoteCoinDenom : item.baseCoinDenom
  );
  //@ts-ignore
  return [...new Set(quoteMap)];
};

export const makeHdPath = (
  accountNumber = '0',
  addressIndex = '0',
  coinType = 118
) => {
  return stringToPath(
    "m/44'/" + coinType + "'/" + accountNumber + "'/0/" + addressIndex
  );
};

export const proposalStatusMap: any = {
  PROPOSAL_STATUS_UNSPECIFIED: 'Nil',
  PROPOSAL_STATUS_DEPOSIT_PERIOD: 'Deposit Period',
  PROPOSAL_STATUS_VOTING_PERIOD: 'Voting Period',
  PROPOSAL_STATUS_PASSED: 'Passed',
  PROPOSAL_STATUS_REJECTED: 'Rejected',
  PROPOSAL_STATUS_FAILED: 'Failed',
};

export const proposalOptionMap: any = {
  1: 'Yes',
  2: 'Abstain',
  3: 'No',
  4: 'No With Veto',
};

export const stringTagParser = (input: any) => {
  const lines = input.split('\n');
  const output: any = [];
  lines.forEach((d: any, i: any) => {
    if (i > 0) {
      output.push(React.createElement('br'));
    }
    output.push(d);
  });
  return output;
};

export const getPairMappings = (pairs: any) => {
  const pairsMapping: any = {};
  if (pairs?.length) {
    for (let pair of pairs) {
      if (!pairsMapping[pair.baseCoinDenom]) {
        pairsMapping[pair.baseCoinDenom] = [];
      }
      if (!pairsMapping[pair.quoteCoinDenom]) {
        pairsMapping[pair.quoteCoinDenom] = [];
      }
      pairsMapping[pair.baseCoinDenom].push(pair.quoteCoinDenom);
      pairsMapping[pair.quoteCoinDenom].push(pair.baseCoinDenom);
    }
  }

  return pairsMapping;
};

export const errorMessageMappingParser = (message: any) => {
  var str = message;

  var truncatedString = str?.match(/ibc\/\w{64}/g);

  for (var i = 0; i < truncatedString?.length; i++) {
    str = str.replace(
      truncatedString[i],
      ' ' + `${ibcDenomToDenom(truncatedString[i])}`
    );
  }
  return str;
};
