import AssetList from "../config/ibc_assets.json";
import { comdex } from "../config/network";
import { commaSeparator, getExponent } from "./number";
import { lowercaseFirstLetter } from "./string";

const getDenomToDisplaySymbolMap = () => {
  let myMap = {};

  for (let i = 0; i < AssetList?.tokens?.length; i++) {
    if (myMap[AssetList?.tokens[i].ibcDenomHash] === undefined) {
      myMap[AssetList?.tokens[i].ibcDenomHash] = AssetList?.tokens[i]?.symbol;
    }
  }

  return myMap;
};

let denomToDisplaySymbol = getDenomToDisplaySymbolMap();

export const getAmount = (selectedAmount, decimal) => {
  let result =
    Number(selectedAmount) * (Number(decimal) || 10 ** comdex.coinDecimals);

  let amountWithoutScientificNumber = convertScientificNumberIntoDecimal(
    Number(result)?.toFixed(0)?.toString()
  );

  return amountWithoutScientificNumber;
};

export const amountConversionWithComma = (amount, decimals) => {
  let finiteAmount = isFinite(Number(amount)) ? Number(amount) : 0;

  const result = Number(finiteAmount) / (decimals || 10 ** comdex.coinDecimals);

  return commaSeparator(result.toFixed(comdex.coinDecimals));
};

export const commaSeparatorWithRounding = (amount, round) => {
  return commaSeparator(amount.toFixed(getExponent(round)));
};

export const amountConversion = (amount, decimals) => {
  let finiteAmount = isFinite(Number(amount)) ? Number(amount) : 0;

  const result = Number(finiteAmount) / (decimals || 10 ** comdex.coinDecimals);

  return result.toFixed(getExponent(decimals) || comdex.coinDecimals);
};

export const convertScientificNumberIntoDecimal = (x) => {
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split("e-")[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = "0." + new Array(e).join("0") + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join("0");
    }
  }
  return x;
};

export const orderPriceConversion = (amount) => {
  let result = Number(amount) * 10 ** 18;
  result = convertScientificNumberIntoDecimal(result);
  return result.toString();
};

export const orderPriceReverseConversion = (amount) => {
  const result = Number(amount) / 10 ** 18;
  return result.toFixed(comdex.coinDecimals).toString();
};

export const denomConversion = (denom) => {
  // Remove: below if for local testing
  if (denom === "weth-wei") {
    return "WETH";
  }

  if (denomToDisplaySymbol[denom]) {
    return denomToDisplaySymbol[denom];
  }

  if (denom && denom.substr(0, 1) === "u") {
    if (
      denom &&
      denom.substr(0, 2) === "uc" &&
      !(denom.substr(0, 3) === "ucm")
    ) {
      return (
        denom.substr(1, denom.length) &&
        lowercaseFirstLetter(denom.substr(1, denom.length))
      );
    }
    return (
      denom.substr(1, denom.length) &&
      denom.substr(1, denom.length).toUpperCase()
    );
  }
};

export const getDenomBalance = (balances, denom) =>
  balances &&
  balances.length > 0 &&
  balances.find((item) => item.denom === denom) &&
  balances.find((item) => item.denom === denom).amount;
