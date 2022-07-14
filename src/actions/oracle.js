import { MARKET_LIST_SET } from "../constants/oracle";

export const setMarkets = (list, pagination) => {
  return {
    type: MARKET_LIST_SET,
    list,
    pagination,
  };
};