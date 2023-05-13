import { message, Spin } from "antd";
import { encode } from "js-base64";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import {
  setAccountAddress,
  setAccountName,
  showAccountConnectModal,
} from "../../../actions/account";
import {
  fetchKeplrAccountName,
  initializeChain,
} from "../../../services/keplr";
import variables from "../../../utils/variables";
import ButtonSubmit from "./Ledger/index";
import styles from "./Header.module.scss";

const ConnectModal = ({
  setAccountAddress,
  setAccountName,
  lang,
  showAccountConnectModal,
}) => {
  const [inProgress, setInProgress] = useState(false);

  const handleConnectToWallet = (walletType) => {
    setInProgress(true);

    initializeChain(walletType, (error, account) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      setAccountAddress(account.address);
      fetchKeplrAccountName().then((name) => {
        setAccountName(name);
      });

      localStorage.setItem("ac", encode(account.address));
      localStorage.setItem("loginType", walletType || "keplr");
      showAccountConnectModal(false);
    });
  };

  return (
    <Spin spinning={inProgress}>
      <div className={styles.dropdown__wallet__menu}>
        <div className={styles.dropdown__wallet__title}>
          {" Connect Wallet"}
        </div>
        <button onClick={() => handleConnectToWallet("keplr")}>
          {"Keplr Wallet"}
        </button>
        <button onClick={() => handleConnectToWallet("leap")}>
          {"Leap Cosmos Wallet"}
        </button>
        <button>
          <ButtonSubmit />
        </button>
      </div>
    </Spin>
  );
};

ConnectModal.propTypes = {
  setAccountAddress: PropTypes.func.isRequired,
  setAccountName: PropTypes.func.isRequired,
  showAccountConnectModal: PropTypes.func.isRequired,
  lang: PropTypes.string,
  show: PropTypes.bool,
};

const stateToProps = (state) => {
  return {
    show: state.account.showModal,
    lang: state.language,
  };
};

const actionsToProps = {
  showAccountConnectModal,
  setAccountAddress,
  setAccountName,
};

export default connect(stateToProps, actionsToProps)(ConnectModal);
