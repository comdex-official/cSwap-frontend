import { TRADE_PAIR } from "../constants/tradePair";

export const setTradeData = (value) => {
  return {
    type: TRADE_PAIR,
    value,
  };
};
