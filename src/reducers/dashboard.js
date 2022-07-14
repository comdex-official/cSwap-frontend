import { combineReducers } from "redux";

import {
  COIN_STATS_FETCH_SUCCESS,
  TOTA_COLLATERAL_LIST_SET,
  PRICE_CHART_DATA_SET,
  RANGE_SET,
  VOLUME_CHART_DATA_SET,
  PRICE_CHART_DATA_FETCH_IN_PROGRESS,
  PRICE_CHART_DATA_FETCH_ERROR,
  VOLUME_CHART_DATA_FETCH_IN_PROGRGESS,
  VOLUME_CHART_DATA_FETCH_ERROR,
} from "../constants/dashboard";

const statistics = (state = {}, action) => {
  if (action.type === COIN_STATS_FETCH_SUCCESS) {
    return action.value;
  }

  return state;
};

const volumeChart = (state = [], action) => {
  if (action.type === VOLUME_CHART_DATA_SET) {
    return action.data;
  }

  return state;
};

const volumeChartInProgress = (state = false, action) => {
  switch (action.type) {
    case VOLUME_CHART_DATA_FETCH_IN_PROGRGESS:
      return action.value;
    case VOLUME_CHART_DATA_SET:
    case VOLUME_CHART_DATA_FETCH_ERROR:
      return false;
    default:
      return state;
  }
};

const priceChart = (state = [], action) => {
  if (action.type === PRICE_CHART_DATA_SET) {
    return action.data;
  }

  return state;
};

const priceChartInProgress = (state = false, action) => {
  switch (action.type) {
    case PRICE_CHART_DATA_FETCH_IN_PROGRESS:
      return action.value;
    case PRICE_CHART_DATA_SET:
    case PRICE_CHART_DATA_FETCH_ERROR:
      return false;
    default:
      return state;
  }
};

const range = (state = "d", action) => {
  if (action.type === RANGE_SET) {
    return action.value;
  }

  return state;
};

const totalCollateralList = (state = [], action) => {
  if (action.type === TOTA_COLLATERAL_LIST_SET) {
    return action.data;
  }

  return state;
};

export default combineReducers({
  statistics,
  volumeChart,
  priceChart,
  range,
  totalCollateralList,
  priceChartInProgress,
  volumeChartInProgress,
});
