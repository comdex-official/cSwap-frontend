import { combineReducers } from "redux";
import account from "./account";
import asset from "./asset";
import language from "./language";
import swap from "./swap";
import liquidity from "./liquidity";
import theme from "./theme";
import oracle from "./oracle";
import order from './order';
import ledger from './ledger'

const app = combineReducers({
  language,
  account,
  asset,
  swap,
  liquidity,
  theme,
  oracle,
  order,
  ledger,
});

const root = (state, action) => {
  if (action.type === "ACCOUNT_ADDRESS_SET" && action.value === "") {
    state.account = undefined; //explicitly clearing account data
  }

  return app(state, action);
};

export default root;
