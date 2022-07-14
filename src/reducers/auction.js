import { combineReducers } from "redux";
import {
  AUCTION_LIST_SET,
  BIDDING_LIST_SET,
  BID_AMOUNT_SET,
  CURRENT_AUCTION_SET,
} from "../constants/auction";

const data = (
  state = {
    list: [],
    pagination: {},
  },
  action
) => {
  if (action.type === AUCTION_LIST_SET) {
    return {
      ...state,
      list: action.list,
      pagination: action.pagination,
    };
  }

  return state;
};

const _ = (state = {}, action) => {
  if (action.type === CURRENT_AUCTION_SET) {
    return action.value || state;
  }

  return state;
};

const bidAmount = (state = 0, action) => {
  if (action.type === BID_AMOUNT_SET) {
    return action.value;
  }

  return state;
};

const bidding = (
  state = {
    list: [],
    pagination: {},
    bidder: "",
  },
  action
) => {
  if (action.type === BIDDING_LIST_SET) {
    return {
      ...state,
      list: action.list,
      pagination: action.pagination,
      bidder: action.bidder,
    };
  }

  return state;
};

export default combineReducers({
  data,
  _,
  bidAmount,
  bidding,
});
