import { combineReducers } from "redux";
import account from "./account";
import asset from "./asset";
import govern from "./govern";
import language from "./language";
import ledger from './ledger';
import liquidity from "./liquidity";
import oracle from "./oracle";
import order from './order';
import swap from "./swap";
import theme from "./theme";
import config from "./config";

const app = combineReducers({
  language,
  config,
  account,
  asset,
  swap,
  liquidity,
  theme,
  oracle,
  order,
  ledger,
  govern
});

const root = (state, action) => {
  if (action.type === "ACCOUNT_ADDRESS_SET" && action.value === "") {
    state.account = undefined; //explicitly clearing account data
  }

  return app(state, action);
};

export default root;
