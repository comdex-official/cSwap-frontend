import { Button, Dropdown, Modal } from "antd";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import {
  setAccountAddress,
  showAccountConnectModal
} from "../../actions/account";
import { SvgIcon } from "../../components/common";
import Copy from "../../components/Copy";
import { comdex } from "../../config/network";
import {
  amountConversionWithComma,
  denomConversion,
  getDenomBalance
} from "../../utils/coin";
import { truncateString } from "../../utils/string";
import variables from "../../utils/variables";

const DisConnectModal = ({
  setAccountAddress,
  lang,
  address,
  name,
  balances,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    setAccountAddress("");
    localStorage.removeItem("ac");
    localStorage.removeItem("loginType");
    window.location.reload();
  };

  const items = [
    {
      label: (
        <div className="wallet-connect-dropdown text-left">
          <div className="wallet-connect-upper">
            <span />
            <div>
              {localStorage.getItem("loginType") === "ledger"
                ? "native-ledger"
                : name}
            </div>
          </div>
          <div className="px-3">
            <div> {variables[lang].balance_wallet}</div>
            <div className="balance__value__data">
              {amountConversionWithComma(
                getDenomBalance(balances, comdex?.coinMinimalDenom) || 0
              )}{" "}
              {denomConversion(comdex?.coinMinimalDenom)}
            </div>
          </div>
          <div className="mt-2 px-3">
            <div>{variables[lang].address_wallet} </div>
            <div className="wallet-address">
              <div className="address-wallet-address d-flex">
                <span className="mr-3"> {truncateString(address, 6, 6)} </span>{" "}
                <Copy text={address} />
              </div>
            </div>
          </div>
          <div className="mb-2 mt-3">
            <Button
              type="primary"
              onClick={showModal}
              className="btn-filled"
              block
              size="small"
            >
              {variables[lang].disconnect}
            </Button>
          </div>
        </div>
      ),
      key: "item-1",
    },
  ];

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        overlayClassName="dropconnect-overlay"
        getPopupContainer={() => document.getElementById('topRightToogle')}
      >
        <div className="connected_button">
          {" "}
          <SvgIcon name="user-icon" />{" "}
        </div>
      </Dropdown>

      <Modal
        centered={true}
        className="connect-modal"
        footer={null}
        header={null}
        open={isModalOpen}
        width={550}
        onCancel={handleCancel}
        onOk={handleOk}
        closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
      >
        <div className="d-flex flex-wrap flex-column">
          <h2> {variables[lang].disconnect_wallet}</h2>
          <div className="d-flex">
            <Button
              type="primary"
              className="btn-filled mx-3"
              size="large"
              onClick={handleCancel}
              block
            >
              {" "}
              {variables[lang].no}
            </Button>
            <Button
              type="primary"
              className="mx-3"
              size="large"
              onClick={handleDisconnect}
              block
            >
              {" "}
              {variables[lang].yes}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

DisConnectModal.propTypes = {
  lang: PropTypes.string.isRequired,
  setAccountAddress: PropTypes.func.isRequired,
  showAccountConnectModal: PropTypes.func.isRequired,
  address: PropTypes.string,
  name: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  show: PropTypes.bool,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    balances: state.account.balances.list,
    show: state.account.showModal,
    name: state.account.name,
  };
};

const actionsToProps = {
  showAccountConnectModal,
  setAccountAddress,
};

export default connect(stateToProps, actionsToProps)(DisConnectModal);
