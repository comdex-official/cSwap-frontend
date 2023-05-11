import { combineReducers } from "redux";
import { SET_ENV_CONFIG, SET_IBC_TOKENS_LIST } from "../constants/config";


const AssetList = (state = [], action) => {
    if (action.type === SET_IBC_TOKENS_LIST) {
        return action.value || [];
    }

    return state;
};
const envCongig = (state = {}, action) => {
    if (action.type === SET_ENV_CONFIG) {
        return action.value || {};
    }

    return state;
};



export default combineReducers({
    AssetList,
    envCongig,
});
