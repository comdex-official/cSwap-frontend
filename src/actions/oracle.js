import { MARKET_LIST_SET, MARKET_PRICE_UPDATE } from "../constants/oracle";

export const setMarkets = (list, pagination) => {
  return {
    type: MARKET_LIST_SET,
    list,
    pagination,
  };
};

export const updateMarketPrice = (value, denom) => {
  return {
    type: MARKET_PRICE_UPDATE,
    value,
    denom,
  };
};