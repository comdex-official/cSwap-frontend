import {
  DEMAND_COIN_AMOUNT_SET,
  DEMAND_COIN_DENOM_SET,
  LIMIT_ORDER_TOGGLE_SET,
  LIMIT_PRICE_SET,
  OFFER_COIN_AMOUNT_SET,
  OFFER_COIN_DENOM_SET,
  PARAMS_SET,
  REVERSE_SET,
  SLIPPAGE_SET,
  SLIPPAGE_TOLERANCE_SET
} from "../constants/swap";

export const setDemandCoinDenom = (value) => {
  return {
    type: DEMAND_COIN_DENOM_SET,
    value,
  };
};

export const setDemandCoinAmount = (value) => {
  return {
    type: DEMAND_COIN_AMOUNT_SET,
    value,
  };
};

export const setOfferCoinDenom = (value) => {
  return {
    type: OFFER_COIN_DENOM_SET,
    value,
  };
};

export const setOfferCoinAmount = (value, fee) => {
  return {
    type: OFFER_COIN_AMOUNT_SET,
    value,
    fee,
  };
};

export const setReverse = (value) => {
  return {
    type: REVERSE_SET,
    value,
  };
};

export const setSlippage = (value) => {
  return {
    type: SLIPPAGE_SET,
    value,
  };
};

export const setSlippageTolerance = (value) => {
  return {
    type: SLIPPAGE_TOLERANCE_SET,
    value,
  };
};

export const setParams = (value) => {
  return {
    type: PARAMS_SET,
    value,
  };
};

export const setLimitOrderToggle = (value) => {
  return {
    type: LIMIT_ORDER_TOGGLE_SET,
    value,
  };
};

export const setLimitPrice = (value) => {
  return {
    type: LIMIT_PRICE_SET,
    value,
  };
};
