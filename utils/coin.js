import { ibcAssets } from '../config/ibc_asset_api';
import { comdex } from '../config/network';
import { DOLLAR_DECIMALS } from '../constants/common';
import { commaSeparator, getExponent } from './number';
import { lowercaseFirstLetter } from './string';
import Decimal from 'decimal.js';

const getDenomToDisplaySymbolMap = () => {
  let myMap = {};
  ibcAssets()
    .then((result) => {
      for (let i = 0; i < result?.tokens?.length; i++) {
        if (myMap[result?.tokens[i].ibcDenomHash] === undefined) {
          myMap[result?.tokens[i].ibcDenomHash] = result?.tokens[i]?.symbol;
        }
      }
    })
    .catch((error) => {
      console.log(error, 'error in assetList Api');
    });

  return myMap;
};

let denomToDisplaySymbol = getDenomToDisplaySymbolMap();

export const amountConversionWithComma = (amount, decimals) => {
  let finiteAmount = isFinite(Number(amount)) ? Number(amount) : 0;

  const result = Number(finiteAmount) / (decimals || 10 ** comdex.coinDecimals);

  return commaSeparator(
    Math.floor(result * Math.pow(10, comdex.coinDecimals)) /
      Math.pow(10, comdex.coinDecimals)
  );
};

export const commaSeparatorWithRounding = (amount, round) => {
  if (amount === 0 || amount === '0' || amount === undefined) {
    return 0;
  }
  return commaSeparator(amount.toFixed(getExponent(round)));
};

export const amountConversion = (amount, decimals) => {
  let finiteAmount = isFinite(Number(amount)) ? Number(amount) : 0;

  const result = Number(finiteAmount) / (decimals || 10 ** comdex.coinDecimals);

  return String(
    Math.floor(result * Math.pow(10, comdex.coinDecimals)) /
      Math.pow(10, comdex.coinDecimals)
  );
};

export const convertScientificNumberIntoDecimal = (x) => {
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split('e-')[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + new Array(e).join('0') + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join('0');
    }
  }
  return x;
};

export const orderPriceConversion = (amount) => {
  let result = Number(amount) * 10 ** 18;
  result = convertScientificNumberIntoDecimal(result);
  return result.toString();
};

export const getAmount = (selectedAmount, decimal) => {
  const decimalSelectedAmount = new Decimal(selectedAmount);
  const decimalCoinDecimals = new Decimal(decimal || 10 ** comdex.coinDecimals);
  const formattedAmount = decimalSelectedAmount.mul(decimalCoinDecimals);
  let amountWithoutScientificNumber = convertScientificNumberIntoDecimal(
    Number(formattedAmount)?.toFixed(0)?.toString()
  );
  return amountWithoutScientificNumber;
};

export const orderPriceReverseConversion = (amount) => {
  const result = Number(amount) / 10 ** 18;
  return result.toFixed(comdex.coinDecimals).toString();
};

export const denomConversion = (denom) => {
  // Remove: below if for local testing
  // if (denom === 'weth-wei') {
  //   return 'WETH';
  // }

  if (denomToDisplaySymbol[denom]) {
    return denomToDisplaySymbol[denom];
  }

  if (denom && denom.substr(0, 1) === 'u') {
    if (
      denom &&
      denom.substr(0, 2) === 'uc' &&
      !(denom.substr(0, 3) === 'ucm')
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

export const fixedDecimal = (_number = 0, _decimal = DOLLAR_DECIMALS) => {
  return Number(
    Math.floor(_number * Math.pow(10, _decimal)) / Math.pow(10, _decimal)
  );
};
