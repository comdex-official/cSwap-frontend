import reducer from "./reducers";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";

const store = createStore(
  reducer,
  composeWithDevTools({
    trace: true,
  })(applyMiddleware(thunk))
);

export default store;
