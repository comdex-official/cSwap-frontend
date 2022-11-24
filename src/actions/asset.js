import { message } from "antd";
import axios from "axios";
import {
  ASSETS_SET,
  IN_ASSET_SET,
  OUT_AMOUNT_SET,
  OUT_ASSET_SET,
  PAIRS_SET,
  PAIR_ID_SET,
  PAIR_SET
} from "../constants/asset";

export const setPairs = (list, pagination) => {
  return {
    type: PAIRS_SET,
    list,
    pagination,
  };
};

export const setPairId = (value) => {
  return {
    type: PAIR_ID_SET,
    value,
  };
};

export const setPair = (value) => {
  return {
    type: PAIR_SET,
    value,
  };
};

export const setAssetIn = (value) => {
  return {
    type: IN_ASSET_SET,
    value,
  };
};

export const setAssetOut = (value) => {
  return {
    type: OUT_ASSET_SET,
    value,
  };
};

export const setAmountOut = (value) => {
  return {
    type: OUT_AMOUNT_SET,
    value,
  };
};

export const setAssets = (list, pagination) => {
  const assetDenomMap = list?.reduce((map, obj) => {
    map[obj?.denom] = obj;
    return map;
  }, {});

  return {
    type: ASSETS_SET,
    list,
    pagination,
    assetDenomMap: assetDenomMap,
  };
};

export const fetchProofHeight = (rest, channel, callback) => {
  let url = `${rest}/ibc/core/channel/v1/channels/${channel}/ports/transfer`;
  const headers = {
    "Content-Type": "application/json",
  };

  axios
    .get(url, {
      headers,
    })
    .then((response) => {
      callback(null, response.data?.proof_height);
    })
    .catch((error) => {
      message.error(error?.message);
      callback(error?.message);
    });
};
