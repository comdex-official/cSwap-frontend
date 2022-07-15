import { message } from "antd";
import axios from "axios";
import CoinGecko from "coingecko-api";
import moment from "moment";
import { ASSET_DATA_SET } from "../constants/asset";
import {
  COIN_STATS_FETCH_ERROR,
  COIN_STATS_FETCH_SUCCESS,
  PRICE_CHART_DATA_FETCH_ERROR,
  PRICE_CHART_DATA_FETCH_IN_PROGRESS,
  PRICE_CHART_DATA_SET,
  RANGE_SET,
  TOTA_COLLATERAL_LIST_SET,
  VOLUME_CHART_DATA_FETCH_ERROR,
  VOLUME_CHART_DATA_FETCH_IN_PROGRGESS,
  VOLUME_CHART_DATA_SET
} from "../constants/dashboard";
import { getPriceChartURL } from "../constants/url";

export const setAssetData = (list, pagination) => {
  return {
    type: ASSET_DATA_SET,
    list,
    pagination,
  };
};

const CoinGeckoClient = new CoinGecko();

export const fetchCoinStatsSuccess = (value) => {
  return {
    type: COIN_STATS_FETCH_SUCCESS,
    value,
  };
};
export const fetchCoinStatsError = (message) => {
  return {
    type: COIN_STATS_FETCH_ERROR,
    message,
  };
};

export const fetchCoinStats =
  (ids = "comdex") =>
  (dispatch) => {
    CoinGeckoClient.coins
      .fetch(ids)
      .then((res) => {
        if (res.data) {
          dispatch(fetchCoinStatsSuccess(res.data));
        }
      })
      .catch((error) => {
        message.error(
          error.response ? error.response.data.message : error.message
        );
        dispatch(
          fetchCoinStatsError(
            error.response ? error.response.data.message : error.message
          )
        );
      });
  };

export const fetchCoinPrices = (ids, callback) =>
  CoinGeckoClient.coins
    .markets({
      ids: ids,
      vs_currency: "usd",
    })
    .then((res) => {
      if (res.data) {
        callback(null, res.data);
      }
    })
    .catch((error) => {
      callback(error);
      message.error(
        error.response ? error.response.data.message : error.message
      );
    });

export const setVolumeChartData = (data) => {
  return {
    type: VOLUME_CHART_DATA_SET,
    data,
  };
};

export const setVolumeChartDataError = (message) => {
  return {
    type: VOLUME_CHART_DATA_FETCH_ERROR,
    message: message,
  };
};

export const setVolumeChartDataFetchInProgress = (value) => {
  return {
    type: VOLUME_CHART_DATA_FETCH_IN_PROGRGESS,
    value,
  };
};

export const fetchVolumeChartData =
  (range, coinId = "comdex") =>
  (dispatch) => {
    dispatch(setVolumeChartDataFetchInProgress(true));
    CoinGeckoClient.coins
      .fetchMarketChartRange(coinId, {
        //range d,w,M,y , note: m - is for minutes
        from: moment().subtract(1, range).unix(),
        to: moment().unix(),
        vs_currency: "usd",
      })
      .then((res) => res.data)
      .then(
        (result) => {
          dispatch(setVolumeChartData(result?.total_volumes));
        },
        (error) => {
          dispatch(setVolumeChartDataError(error?.message));
          message.error(error?.message);
        }
      );
  };

export const setPriceChartData = (data) => {
  return {
    type: PRICE_CHART_DATA_SET,
    data,
  };
};

export const setPriceChartDataError = (message) => {
  return {
    type: PRICE_CHART_DATA_FETCH_ERROR,
    message: message,
  };
};

export const fetchPriceChartDataInProgress = (value) => {
  return {
    type: PRICE_CHART_DATA_FETCH_IN_PROGRESS,
    value,
  };
};
export const fetchPriceChartData = (range) => (dispatch) => {
  dispatch(fetchPriceChartDataInProgress(true));
  axios
    .get(getPriceChartURL(range))
    .then((response) => {
      dispatch(setPriceChartData(response?.data));
    })
    .catch((error) => {
      dispatch(setPriceChartDataError(error?.message));
      message.error(error?.message);
    });
};

export const setRange = (value) => {
  return {
    type: RANGE_SET,
    value,
  };
};

export const setTotalCollateralList = (data) => {
  return {
    type: TOTA_COLLATERAL_LIST_SET,
    data,
  };
};
