import { Decimal } from "@cosmjs/math";
import { DOLLAR_DECIMALS } from "../constants/common";
import { amountConversion } from "./coin";

export const formatNumber = (number) => {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(DOLLAR_DECIMALS) + "K";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(DOLLAR_DECIMALS) + "M";
  } else if (number < 1000) {
    return number;
  }
};

export const commaSeparator = (value) => {
  const array = value.toString().split(".");
  const stringWithComma = array[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (array[1]) {
    return stringWithComma.concat(".", array[1]);
  }

  return stringWithComma;
};

export const decimalConversion = (data) => {
  return Decimal.fromAtomics(data || "0", 18).toString();
};

export const marketPrice = (array, denom) => {
  if (array?.[denom]?.price && array?.[denom]?.price !== "-") {
    return array?.[denom]?.price;
  }

  return 0; // returning 0 values if price not exists.
};

export const calculateDollarValue = (
  rewardMap,
  markets,
  poolId,
  rewardType
) => {
  let dollarValue = 0;

  for (const [key, value] of Object.entries(rewardMap[poolId][rewardType])) {
    dollarValue += amountConversion(value) * marketPrice(markets, key);
  }

  return dollarValue;
};

export const getAccountNumber = (value) => {
  return value === "" ? "0" : value;
};
