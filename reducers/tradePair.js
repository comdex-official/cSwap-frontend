import { combineReducers } from "redux";
import { TRADE_PAIR } from "../constants/tradePair";

const tradeData = (state = {}, action) => {
  if (action.type === TRADE_PAIR) {
    return action.value || {};
  }

  return state;
};

export default combineReducers({
  tradeData,
});
