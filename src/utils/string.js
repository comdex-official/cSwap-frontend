import { sha256, stringToPath } from "@cosmjs/crypto";
import { comdex, ibcDenoms } from "../config/network";
import { getExponent } from "./number";

const encoding = require("@cosmjs/encoding");

export const decode = (hash) =>
  decodeURIComponent(hash.replace("#", "")) || undefined;

export const generateHash = (txBytes) =>
  encoding.toHex(sha256(txBytes)).toUpperCase();

export const ibcDenomToDenom = (key) => {
  switch (key) {
    case ibcDenoms["uatom"]:
      return "uatom";
    case ibcDenoms["uosmo"]:
      return "uosmo";
    case ibcDenoms["uusdc"]:
      return "uusdc";
    case ibcDenoms["weth-wei"]:
      return "WETH";
    case ibcDenoms["ujuno"]:
      return "ujuno";
    case ibcDenoms["wbtc-satoshi"]:
      return "wbtc-satoshi";
    case ibcDenoms["stuatom"]:
      return "stuatom";
    default:
      return "";
  }
};

export const denomToSymbol = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "ATOM";
    case "udvpn":
      return "DVPN";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "OSMO";
    case "ucmdx":
      return "CMDX";
    case "uusdc":
      return "USDC";
    case "weth-wei":
      return "WETH";
    default:
      return "cosmos";
  }
};

export const minimalDenomToDenom = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "atom";
    case "udvpn":
      return "dvpn";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "osmo";
    case "ucmdx":
      return "cmdx";
    default:
      return "";
  }
};

const iconMap = {
  ucgold: "gold-icon",
  ucsilver: "silver-icon",
  ucoil: "crude-oil",
  uatom: "atom-icon",
  [ibcDenoms["uatom"]]: "atom-icon",
  ucmdx: "comdex-icon",
  uosmo: "osmosis-icon",
  [ibcDenoms["uosmo"]]: "osmosis-icon",
  ucmst: "cmst-icon",
  uharbor: "harbor-icon",
  uusdc: "usdc-icon",
  [ibcDenoms["uusdc"]]: "usdc-icon",
  "weth-wei": "weth-icon",
  [ibcDenoms["weth-wei"]]: "weth-icon",
  ujuno: "juno-icon",
  [ibcDenoms["ujuno"]]: "juno-icon",
  "wbtc-satoshi": "wbtc-icon",
  [ibcDenoms["wbtc-satoshi"]]: "wbtc-icon",
  stuatom: "statom-icon",
  [ibcDenoms["stuatom"]]: "statom-icon",
};

export const iconNameFromDenom = (denom) => {
  return iconMap[denom];
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
