import { combineReducers } from "redux";
import { AMOUNT_SET, ORDER_LIST_SET, TYPE_SET } from "../constants/order";

const type = (state = "limit", action) => {
  if (action.type === TYPE_SET) {
    return action.value;
  }

  return state;
};

const amount = (state = 0, action) => {
  if (action.type === AMOUNT_SET) {
    return action.value;
  }

  return state;
};

const list = (state = [], action) => {
  if (action.type === ORDER_LIST_SET) {
    return action.list;
  }

  return state;
};

export default combineReducers({
  type,
  amount,
  list,
});
