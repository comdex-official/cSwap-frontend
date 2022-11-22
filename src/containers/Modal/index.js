import "./index.scss";
// import "antd/dist/antd.css";
import * as PropTypes from "prop-types";
import { Spin, message } from "antd";
import { connect } from "react-redux";
import { encode } from "js-base64";
import { fetchKeplrAccountName, initializeChain } from "../../services/keplr";

import {
  setAccountAddress,
  setAccountName,
  showAccountConnectModal,
} from "../../actions/account";
import React, { useState } from "react";
import variables from "../../utils/variables";
import ButtonSubmit from "../NavigationBar/Ledger";

const ConnectModal = ({
  setAccountAddress,
  setAccountName,
  lang,
  showAccountConnectModal,
}) => {
  const [inProgress, setInProgress] = useState(false);

  const handleConnectToKeplr = () => {
    setInProgress(true);

    initializeChain((error, account) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      setAccountAddress(account.address);
      fetchKeplrAccountName().then((name)=>{
        setAccountName(name);
      })

      localStorage.setItem("ac", encode(account.address));
      localStorage.setItem("loginType", "keplr")
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
          <div className="wallet-links" onClick={handleConnectToKeplr}>
            <span>{variables[lang].keplr_wallet}</span>{" "}
          </div>
        </div>
        <div className="wallet-links">
        <ButtonSubmit/>
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
