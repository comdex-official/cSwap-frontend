import { combineReducers } from "redux";
import { MARKET_LIST_SET, MARKET_PRICE_UPDATE } from "../constants/oracle";

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
      pagination: action.pagination,
    };
  } else if (action?.type === MARKET_PRICE_UPDATE) {
    return {
      ...state,
      list: {
        ...state?.list,
        ...{
          external: {
            [action?.denom]: { denom: action?.denom, price: action?.value },
          },
        },
      },
    };
  }

  return state;
};

export default combineReducers({
  market,
});
