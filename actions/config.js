import {
  SET_ENV_CONFIG,
  SET_IBC_TOKENS_ICONS,
  SET_IBC_TOKENS_LIST,
} from "../constants/config";

export const setAssetList = (value) => {
  return {
    type: SET_IBC_TOKENS_LIST,
    value,
  };
};
export const setEnvConfig = (value) => {
  return {
    type: SET_ENV_CONFIG,
    value,
  };
};

export const setIconList = (value) => {
  return {
    type: SET_IBC_TOKENS_ICONS,
    value,
  };
};
