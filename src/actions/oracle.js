import { MARKET_LIST_SET } from "../constants/oracle";

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

