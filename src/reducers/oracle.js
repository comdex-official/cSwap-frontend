import { combineReducers } from "redux";
import { MARKET_LIST_SET } from "../constants/oracle";

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

export default combineReducers({
  market,
});
