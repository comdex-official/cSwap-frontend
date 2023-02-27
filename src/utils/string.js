import { sha256, stringToPath } from "@cosmjs/crypto";
import AssetList from "../config/ibc_assets.json";
import { comdex, ibcDenoms } from "../config/network";
import { getExponent } from "./number";

const getIbcDenomToDenomMap = () => {
  let myMap = {};

  for (let i = 0; i < AssetList?.tokens?.length; i++) {
    if (myMap[AssetList?.tokens[i].ibcDenomHash] === undefined) {
      myMap[AssetList?.tokens[i].ibcDenomHash] =
        AssetList?.tokens[i]?.coinMinimalDenom;
    }
  }

  return myMap;
};

let ibcDenomToDenomMap = getIbcDenomToDenomMap();

const encoding = require("@cosmjs/encoding");

export const decode = (hash) =>
  decodeURIComponent(hash.replace("#", "")) || undefined;

export const generateHash = (txBytes) =>
  encoding.toHex(sha256(txBytes)).toUpperCase();

export const ibcDenomToDenom = (key) => ibcDenomToDenomMap?.[key];

const iconMap = {
  ucmdx: "comdex-icon",
  ucmst: "cmst-icon",
  uharbor: "harbor-icon",
  // taking coinMinimalDenom to match ibc denom and fetch icon.
  [ibcDenoms["uatom"]]: "atom-icon",
  [ibcDenoms["uosmo"]]: "osmosis-icon",
  [ibcDenoms["uusdc"]]: "usdc-icon",
  [ibcDenoms["weth-wei"]]: "weth-icon",
  [ibcDenoms["ujuno"]]: "juno-icon",
  [ibcDenoms["wbtc-satoshi"]]: "wbtc-icon",
  [ibcDenoms["stuatom"]]: "statom-icon",
  [ibcDenoms["wmatic-wei"]]: "wmatic-icon",
  [ibcDenoms["dai-wei"]]: "dai-icon",
  [ibcDenoms["aevmos"]]: "evmos-icon",
  [ibcDenoms["wbnb-wei"]]: "wbnb-icon",
  "weth-wei": "weth-icon", // remove: this before pushing to devnet/testnet only for testing
  [ibcDenoms["uluna"]]: "luna2-icon",
  [ibcDenoms["acanto"]]: "canto-icon",
  [ibcDenoms["uakt"]]: "akt-icon",
  [ibcDenoms["uxprt"]]: "xprt-icon",
  [ibcDenoms["stuosmo"]]: "stosmo-icon",
  [ibcDenoms["wftm-wei"]]: "wfmt-icon",
  [ibcDenoms["umntl"]]: "mntl-icon",
  [ibcDenoms["shib-wei"]]: "shib-icon",
  [ibcDenoms["uhuahua"]]: "huahua-icon",
  [ibcDenoms["gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]]:
  "gusdc-icon",
};

export const iconNameFromDenom = (denom) => {
  if (denom) {
    return iconMap[denom];
  }
};

export const orderStatusText = (key) => {
  switch (key) {
    case 0:
      return "UNSPECIFIED";
    case 1:
      return "NOT EXECUTED";
    case 2:
      return "NOT MATCHED";
    case 3:
      return "PARTIALLY MATCHED";
    case 4:
      return "COMPLETED";
    case 5:
      return "CANCELED";
    case 6:
      return "EXPIRED";
    default:
      return "";
  }
};

export const trimWhiteSpaces = (data) => data.split(" ").join("");

export const truncateString = (string, front, back) => {
  if (typeof string === "string") {
    return `${string?.substr(0, front)}...${string?.substr(
      string?.length - back,
      string?.length
    )}`;
  }
};

export const lowercaseFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1).toUpperCase();
};

//Considering input with given decimal point only.
export const toDecimals = (value, decimal) =>
  value.indexOf(".") >= 0
    ? value.substr(0, value.indexOf(".")) +
      value.substr(
        value.indexOf("."),
        Number(decimal)
          ? Number(getExponent(decimal)) + 1
          : comdex?.coinDecimals + 1 //  characters from start to end (exclusive), so adding extra 1
      )
    : value;

export const uniqueDenoms = (list, type) => {
  return [
    ...new Set(
      list && list.length > 0
        ? list.map((item) => (type === "in" ? item.denomIn : item.denomOut))
        : []
    ),
  ];
};

export const uniqueLiquidityPairDenoms = (list, type) => {
  return [
    ...new Set(
      list && list.length > 0
        ? list.map((item) =>
            type === "in" ? item.baseCoinDenom : item.quoteCoinDenom
          )
        : []
    ),
  ];
};

export const uniqueQuoteDenomsForBase = (list, type, denom) => {
  const quoteList =
    list && list.length > 0
      ? list.filter((item) =>
          type === "in"
            ? item.baseCoinDenom === denom
            : item.quoteCoinDenom === denom
        )
      : [];

  const quoteMap = quoteList.map((item) =>
    type === "in" ? item.quoteCoinDenom : item.baseCoinDenom
  );

  return [...new Set(quoteMap)];
};

export const makeHdPath = (
  accountNumber = "0",
  addressIndex = "0",
  coinType = comdex.coinType
) => {
  return stringToPath(
    "m/44'/" + coinType + "'/" + accountNumber + "'/0/" + addressIndex
  );
};

export const proposalStatusMap = {
  PROPOSAL_STATUS_UNSPECIFIED: "Nil",
  PROPOSAL_STATUS_DEPOSIT_PERIOD: "Deposit Period",
  PROPOSAL_STATUS_VOTING_PERIOD: "Voting Period",
  PROPOSAL_STATUS_PASSED: "Passed",
  PROPOSAL_STATUS_REJECTED: "Rejected",
  PROPOSAL_STATUS_FAILED: "Failed",
};

export const proposalOptionMap = {
  1: "Yes",
  2: "Abstain",
  3: "No",
  4: "No With Veto",
};

export const stringTagParser = (input) => {
  const lines = input.split("\n");
  const output = [];
  lines.forEach((d, i) => {
    if (i > 0) {
      output.push(<br />);
    }
    output.push(d);
  });
  return output;
};

export const getPairMappings = (pairs) => {
  const pairsMapping = {};
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
