import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import 'antd/dist/reset.css';
import App from "./App";
import React from "react";
import { CautionNotice } from "./components/common";
import { createRoot } from "react-dom/client";
import store from "./store";

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <CautionNotice />
      <App />
    </BrowserRouter>
  </Provider>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(app);

serviceWorker.unregister();
