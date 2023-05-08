import { combineReducers } from "redux";
import {
  ACCOUNT_ADDRESS_SET,
  ACCOUNT_BALANCES_SET,
  ACCOUNT_CONNECT_MODAL_SHOW,
  ACCOUNT_NAME_SET,
  ACCOUNT_POOL_BALANCE_SET,
  ACCOUNT_VAULTS_SET,
  ASSET_BALANCE_SET,
  BALANCE_REFRESH_SET,
  FORM_MODAL_SHOW,
  TOTAL_VALUE_SET,
  TRANSACTION_HISTORY_SET,
  VAULT_SET
} from "../../constants/account";

const address = (state = "", action) => {
  if (action.type === ACCOUNT_ADDRESS_SET) {
    return action.value;
  }

  return state;
};

const showModal = (state = false, action) => {
  if (action.type === ACCOUNT_CONNECT_MODAL_SHOW) {
    return action.value;
  }

  return state;
};

const vaults = (
  state = {
    list: [],
    pagination: {},
  },
  action
) => {
  if (action.type === ACCOUNT_VAULTS_SET) {
    return {
      ...state,
      list: action.list,
      pagination: action.pagination,
    };
  }

  return state;
};

const totalValue = (state = 0, action) => {
  if (action.type === TOTAL_VALUE_SET) {
    return action.value;
  }

  return state;
};

const history = (
  state = {
    list: [],
    count: 0,
  },
  action
) => {
  if (action.type === TRANSACTION_HISTORY_SET) {
    return {
      ...state,
      list: action.list,
      count: action.count,
    };
  }

  return state;
};

const showFormModal = (
  state = {
    show: false,
    key: "",
  },
  action
) => {
  if (action.type === FORM_MODAL_SHOW) {
    return {
      ...state,
      key: action.key,
      show: action.show,
    };
  }

  return state;
};

const vault = (state = {}, action) => {
  if (action.type === VAULT_SET) {
    return action.value || {};
  }

  return state;
};

const refreshBalance = (state = 1, action) => {
  if (action.type === BALANCE_REFRESH_SET) {
    return action.value || state;
  }

  return state;
};

const balances = (
  state = {
    list: [],
    pagination: {},
    asset: 0,
    pool: 0,
  },
  action
) => {
  switch (action.type) {
    case ACCOUNT_BALANCES_SET:
      return {
        ...state,
        list: action.list,
        pagination: action.pagination,
      };
    case ASSET_BALANCE_SET:
      return {
        ...state,
        asset: action.value,
      };
    case ACCOUNT_POOL_BALANCE_SET:
      return {
        ...state,
        pool: action.value,
      };
    default:
      return state;
  }
};

const name = (state = "", action) => {
  if (action.type === ACCOUNT_NAME_SET) {
    return action.value;
  }

  return state;
};

export default combineReducers({
  address,
  showModal,
  vaults,
  totalValue,
  history,
  showFormModal,
  vault,
  balances,
  refreshBalance,
  name,
});
