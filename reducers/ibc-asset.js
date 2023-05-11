import { combineReducers } from 'redux';
import { ALL_TOKEN_JSON, IBC_ASSET_JSON } from '../constants/ibc-asset';

const ibc_asset = (state = {}, action) => {
  if (action.type === IBC_ASSET_JSON) {
    return action?.ibc || {};
  }

  return state;
};
const allToken = (state = {}, action) => {
  if (action.type === ALL_TOKEN_JSON) {
    return action.token;
  }

  return state;
};

export default combineReducers({
  ibc_asset,
  allToken,
});
