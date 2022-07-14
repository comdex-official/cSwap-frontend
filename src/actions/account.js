import {
  ACCOUNT_ADDRESS_SET,
  ACCOUNT_BALANCES_SET,
  ACCOUNT_CONNECT_MODAL_SHOW,
  TRANSACTION_HISTORY_SET,
  ASSET_BALANCE_SET,
  cASSET_BALANCE_SET,
  ACCOUNT_POOL_BALANCE_SET,
  DEBT_BALANCE_SET,
  COLLATERAL_BALANCE_SET,
  BALANCE_REFRESH_SET,
  ACCOUNT_NAME_SET,
} from "../constants/account";

export const setAccountAddress = (value) => {
  return {
    type: ACCOUNT_ADDRESS_SET,
    value,
  };
};

export const setAccountName = (value) => {
  return {
    type: ACCOUNT_NAME_SET,
    value,
  };
};

export const showAccountConnectModal = (value) => {
  return {
    type: ACCOUNT_CONNECT_MODAL_SHOW,
    value,
  };
};

export const setTransactionHistory = (list, count) => {
  return {
    type: TRANSACTION_HISTORY_SET,
    list,
    count,
  };
};

export const setAccountBalances = (list, pagination) => {
  return {
    type: ACCOUNT_BALANCES_SET,
    list,
    pagination,
  };
};

export const setAssetBalance = (value) => {
  return {
    type: ASSET_BALANCE_SET,
    value,
  };
};

export const setcAssetBalance = (value) => {
  return {
    type: cASSET_BALANCE_SET,
    value,
  };
};

export const setPoolBalance = (value) => {
  return {
    type: ACCOUNT_POOL_BALANCE_SET,
    value,
  };
};

export const setDebtBalance = (value) => {
  return {
    type: DEBT_BALANCE_SET,
    value,
  };
};

export const setCollateralBalance = (value) => {
  return {
    type: COLLATERAL_BALANCE_SET,
    value,
  };
};

export const setBalanceRefresh = (value) => {
  return {
    type: BALANCE_REFRESH_SET,
    value,
  };
};
