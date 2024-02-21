import { combineReducers } from "redux";
import { TOGGLE_DARK_THEME } from "../constants/theme";

const theme = (state = { darkThemeEnabled: true }, action) => {
  switch (action.type) {
    case TOGGLE_DARK_THEME:
      return { ...state, darkThemeEnabled: action.value };

    default:
      return state;
  }
};

export default combineReducers({ theme });
