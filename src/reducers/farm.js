import { COMPLETE_SET } from "../constants/farm";
import { combineReducers } from "redux";

const complete = (state = false, action) => {
  if (action.type === COMPLETE_SET) {
    return action.value;
  }

  return state;
};

export default combineReducers({
  complete,
});
