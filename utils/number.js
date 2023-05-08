import { Decimal } from "@cosmjs/math";
import { DOLLAR_DECIMALS } from "../constants/common";

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
  // Remove: below if condition for testing local purpose
  if (denom === "weth-wei") {
    return 1450;
  }
  
  if (array?.[denom]?.price && array?.[denom]?.price !== "-") {
    return array?.[denom]?.price;
  }

  return 0; // returning 0 values if price not exists.
};

export const getAccountNumber = (value) => {
  return value === "" ? "0" : value;
};

export const getExponent = (number) => {
  let count = 0;
  while (number > 1) {
    number = number / 10;
    count++;
  }

  return count;
};

export const getAMP = (currentPrice, minimumPrice, maximumPrice) => {
  return (
    1 /
    (1 -
      (1 / 2) *
        (Math.sqrt(minimumPrice / currentPrice) +
          Math.sqrt(currentPrice / maximumPrice)))
  );
};

export const rangeToPercentage = (min, max, input) =>
  Number(((input - min) * 100) / (max - min))?.toFixed(0);

export const detectBestDecimalsDisplay = (
  price,
  minDecimal = 2,
  minPrice = 1,
  maxDecimal
) => {
  if (price && price > minPrice) return minDecimal;
  let decimals = minDecimal;
  if (price !== undefined) {
    // Find out the number of leading floating zeros via regex
    const priceSplit = price.toString().split(".");
    if (priceSplit.length === 2 && priceSplit[0] === "0") {
      const leadingZeros = priceSplit[1].match(/^0+/);
      decimals += leadingZeros ? leadingZeros[0].length + 1 : 1;
    }
  }
  if (maxDecimal && decimals > maxDecimal) decimals = maxDecimal;
  return decimals;
};

export const formateNumberDecimalsAuto = ({
  price,
  maxDecimal,
  unit,
  minDecimal,
  minPrice,
}) => {
  minDecimal = minDecimal ? minDecimal : 2;
  minPrice = minPrice ? minPrice : 1;
  let res =
    formateNumberDecimals(
      price,
      detectBestDecimalsDisplay(price, minDecimal, minPrice, maxDecimal)
    ) + (unit ? unit : "");
  return res;
};

export const formateNumberDecimals = (price, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: decimals,
  }).format(price);
};