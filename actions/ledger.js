import {
  SET_LEDGER_ACCOUNT_NUMBER,
  SIGN_IN_LEDGER_MODAL_HIDE,
} from "../constants/ledger";
import { fetchAddress } from "../utils/ledger";
import { message } from "antd";
import { setAccountAddress } from "./account";

export const hideLedgerModal = (data) => {
  return {
    type: SIGN_IN_LEDGER_MODAL_HIDE,
    data,
  };
};

export const setAccountNumber = (data) => {
  return {
    type: SET_LEDGER_ACCOUNT_NUMBER,
    data,
  };
};

export const fetchLedgerAddress = (accountNumber = "0", addressIndex = "0") => {
  return async (dispatch) => {
    try {
      let ledgerResponse = fetchAddress(accountNumber, addressIndex);
      ledgerResponse
        .then(function (address) {
          localStorage.setItem("loginType", "ledger");
          dispatch(setAccountAddress(address));
        })
        .catch((error) => {
          message.error(
            error.response ? error.response.data.message : error.message
          );
        });
    } catch (error) {
      message.error(
        error.response ? error.response.data.message : error.message
      );
    }
  };
};
