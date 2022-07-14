import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import App from "./App";
import React from "react";
import reducer from "./reducers";
import thunk from "redux-thunk";
import { CautionNotice } from "./components/common";
import { createRoot } from 'react-dom/client';

const store = createStore(
  reducer,
  composeWithDevTools({
    trace: true,
  })(applyMiddleware(thunk))
);

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <CautionNotice />
      <App />
    </BrowserRouter>
  </Provider>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(app);

serviceWorker.unregister();