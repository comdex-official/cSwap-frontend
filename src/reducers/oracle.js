import { combineReducers } from "redux";
import { LP_PRICES_SET, MARKET_LIST_SET } from "../constants/oracle";

const market = (
  state = {
    list: {},
    pagination: {},
  },
  action
) => {
  if (action.type === MARKET_LIST_SET) {
    return {
      ...state,
      list: action?.list,
      pagination: action?.pagination,
    };
  }

  return state;
};

const lpPrice = (
  state = {
    list: [],
  },
  action
) => {
  if (action.type === LP_PRICES_SET) {
    return {
      ...state,
      list: action?.list,
    };
  }

  return state;
};

export default combineReducers({
  market,
  lpPrice,
});
