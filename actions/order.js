import { AMOUNT_SET, ORDER_LIST_SET, TYPE_SET } from "../constants/order";

export const setType = (value) => {
  return {
    type: TYPE_SET,
    value,
  };
};

export const setAmount = (value) => {
  return {
    type: AMOUNT_SET,
    value,
  };
};

export const setOrders = (list) => {
  return {
    type: ORDER_LIST_SET,
    list,
  };
};
