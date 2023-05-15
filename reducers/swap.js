import { combineReducers } from "redux";
import {
  CAUTION_NOTICE_VALUES_SET, DEFAULT_SLIPPAGE_TOLERANCE,
  DEMAND_COIN_AMOUNT_SET,
  DEMAND_COIN_DENOM_SET,
  LIMIT_ORDER_TOGGLE_SET,
  LIMIT_PRICE_SET,
  OFFER_COIN_AMOUNT_SET,
  OFFER_COIN_DENOM_SET,
  PARAMS_SET,
  REVERSE_SET,
  SLIPPAGE_SET,
  SLIPPAGE_TOLERANCE_SET,
  SWAP_CALCULATIONS_SET
} from "../constants/swap";

const cautionNotice = (state = { show: false, isAccepted: false }, action) => {
  if (action.type === CAUTION_NOTICE_VALUES_SET) {
    return {
      show: action.show,
      isAccepted: action.isAccepted,
    };
  }

  return state;
};

const offerCoin = (
  state = {
    amount: 0,
    denom: "",
    fee: 0,
  },
  action
) => {
  switch (action.type) {
    case OFFER_COIN_DENOM_SET: {
      return {
        ...state,
        denom: action.value,
      };
    }

    case OFFER_COIN_AMOUNT_SET:
      return {
        ...state,
        amount: action.value,
        fee: action.fee,
      };

    default:
      return state;
  }
};

const demandCoin = (
  state = {
    amount: 0,
    denom: "",
  },
  action
) => {
  switch (action.type) {
    case DEMAND_COIN_DENOM_SET: {
      return {
        ...state,
        denom: action.value,
      };
    }

    case DEMAND_COIN_AMOUNT_SET:
      return {
        ...state,
        amount: action.value,
      };

    default:
      return state;
  }
};

const calculations = (
  state = {
    expectedAmount: 0,
    price: 0,
    amount: 0,
  },
  action
) => {
  if (action.type === SWAP_CALCULATIONS_SET) {
    return {
      ...state,
      amount: action?.amount,
      expectedAmount: action?.expectedAmount,
      price: action?.price,
    };
  }

  return state;
};

const reverse = (state = false, action) => {
  if (action.type === REVERSE_SET) {
    return action.value || false;
  }

  return state;
};

// considering the value in percentage
const slippage = (state = 0, action) => {
  if (action.type === SLIPPAGE_SET) {
    return action.value || 0;
  }

  return state;
};

// considering the value in percentage
const slippageTolerance = (state = DEFAULT_SLIPPAGE_TOLERANCE, action) => {
  if (action.type === SLIPPAGE_TOLERANCE_SET) {
    return action.value;
  }

  return state;
};

const params = (state = {}, action) => {
  if (action.type === PARAMS_SET) {
    return action.value;
  }

  return state;
};

const isLimitOrder = (state = false, action) => {
  if (action.type === LIMIT_ORDER_TOGGLE_SET) {
    return action.value;
  }
  return state;
};

const limitPrice = (state = 0, action) => {
  if (action.type === LIMIT_PRICE_SET) {
    return action.value;
  }
  return state;
};

export default combineReducers({
  cautionNotice,
  demandCoin,
  offerCoin,
  reverse,
  slippage,
  params,
  slippageTolerance,
  isLimitOrder,
  limitPrice,
  calculations,
});
