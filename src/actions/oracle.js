import { LP_PRICES_SET, MARKET_LIST_SET } from "../constants/oracle";

export const setMarkets = (list, pagination) => {

  const priceMap = list?.reduce((map, obj) => {
    map[obj?.denom] = obj;
    return map;
  }, {});

  return {
    type: MARKET_LIST_SET,
    list: priceMap,
    pagination,
  };
};


export const setLPPrices = (list, pagination) => {
  return {
    type: LP_PRICES_SET,
    list,
    pagination,
  };
};

