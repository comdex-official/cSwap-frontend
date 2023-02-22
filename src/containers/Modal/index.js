import { message, Spin } from "antd";
import { encode } from "js-base64";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import {
  setAccountAddress,
  setAccountName,
  showAccountConnectModal
} from "../../actions/account";
import { fetchKeplrAccountName, initializeChain } from "../../services/keplr";
import variables from "../../utils/variables";
import ButtonSubmit from "../NavigationBar/Ledger";
import "./index.scss";

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
      <div className="wallet-connect-dropdown">
        <div className="wallet-connect-upper">
          <h3 className="text-center">{variables[lang].connect_wallet}</h3>
        </div>
        <div className="mb-2 mt-3">
          <div
            className="wallet-links"
            onClick={() => handleConnectToWallet("keplr")}
          >
            <span>{variables[lang].keplr_wallet}</span>{" "}
          </div>
        </div>
        <div className="mb-2">
          <div
            className="wallet-links"
            onClick={() => handleConnectToWallet("leap")}
          >
            <span>{variables[lang].leap_wallet}</span>{" "}
          </div>
        </div>
        <div className="wallet-links">
          <ButtonSubmit />
        </div>
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
