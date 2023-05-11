import { ALL_TOKEN_JSON, IBC_ASSET_JSON } from '../constants/ibc-asset';

export const setIbcAsset = (value) => {
  return {
    type: IBC_ASSET_JSON,
    value,
  };
};

export const setAllToken = (value) => {
  return {
    type: ALL_TOKEN_JSON,
    value,
  };
};
