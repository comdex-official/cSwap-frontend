import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLedgerAddress } from "../../../actions/ledger";
import { getAccountNumber } from "../../../utils/number";

const ButtonSubmit = () => {
  const dispatch = useDispatch();
  const accountIndex = useSelector((state) => state.ledger.accountIndex);
  const accountNumber = useSelector((state) => state.ledger.accountNumber);

  const onClick = () => {
    dispatch(
      fetchLedgerAddress(
        getAccountNumber(accountNumber.value),
        getAccountNumber(accountIndex.value)
      )
    );
  };

  return <div onClick={onClick}>Ledger</div>;
};

export default ButtonSubmit;
