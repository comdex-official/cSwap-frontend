import { combineReducers } from "redux";
import {
  APP_ASSETS_SET, ASSETS_IN_PROGRESS_SET,
  ASSETS_SET,
  COLLATERAL_RATIO_SET,
  IN_AMOUNT_SET,
  IN_ASSET_SET,
  OUT_AMOUNT_SET,
  OUT_ASSET_SET,
  PAIRS_SET,
  PAIR_ID_SET, PAIR_SET
} from "../constants/asset";

const pairs = (
  state = {
    list: [],
    pagination: {},
  },
  action
) => {
  if (action.type === PAIRS_SET) {
    return {
      list: action.list,
      pagination: action.pagination,
    };
  }

  return state;
};

const _ = (
  state = {
    list: [],
    pagination: {},
    inProgress: false,
    assetDenomMap: {},
  },
  action
) => {
  switch (action.type) {
    case ASSETS_SET:
      return {
        ...state,
        list: action.list,
        pagination: action.pagination,
        assetDenomMap: action.assetDenomMap,
      };
    case ASSETS_IN_PROGRESS_SET:
      return {
        ...state,
        inProgress: action?.value,
      };

    default:
      return state;
  }
};

const appAssetMap = (state = {}, action) => {
  if (action.type === APP_ASSETS_SET) {
    return action?.map || {};
  }

  return state;
};
const map = (state = {}, action) => {
  if (action.type === ASSETS_SET) {
    return action.map;
  }

  return state;
};

const pairId = (state = null, action) => {
  if (action.type === PAIR_ID_SET) {
    return action.value || state;
  }

  return state;
};

const pair = (state = {}, action) => {
  if (action.type === PAIR_SET) {
    return action.value || state;
  }

  return state;
};

const inAsset = (state = "", action) => {
  if (action.type === IN_ASSET_SET) {
    return action.value || "";
  }

  return state;
};

const outAsset = (state = "", action) => {
  if (action.type === OUT_ASSET_SET) {
    return action.value || "";
  }

  return state;
};

const inAmount = (state = 0, action) => {
  if (action.type === IN_AMOUNT_SET) {
    return action.value || 0;
  }

  return state;
};

const outAmount = (state = 0, action) => {
  if (action.type === OUT_AMOUNT_SET) {
    return action.value || 0;
  }

  return state;
};

const collateralRatio = (state = 150, action) => {
  if (action.type === COLLATERAL_RATIO_SET) {
    return action.value || 0;
  }

  return state;
};

export default combineReducers({
  pairs,
  pairId,
  pair,
  _,
  outAsset,
  inAsset,
  inAmount,
  outAmount,
  collateralRatio,
  map,
  appAssetMap,
});
