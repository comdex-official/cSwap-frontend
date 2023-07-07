import { Button, Dropdown, Modal } from 'antd';
import * as PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  setAccountAddress,
  showAccountConnectModal,
} from '../../../actions/account';
import { comdex } from '../../../config/network';
import {
  amountConversionWithComma,
  denomConversion,
  getDenomBalance,
} from '../../../utils/coin';
import { truncateString } from '../../../utils/string';
import variables from '../../../utils/variables';
import Copy from '../Copy';
import { Icon } from '../../../shared/image/Icon';
import { NextImage } from '../../image/NextImage';
import { Cosmos, Keplr, Ledger } from '../../image';
import styles from './Header.module.scss';

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
    setAccountAddress('');
    localStorage.removeItem('ac');
    localStorage.removeItem('loginType');
    window.location.reload();
  };

  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const showModal2 = () => {
    setIsModalOpen2(true);
  };

  const handleOk2 = () => {
    setIsModalOpen2(false);
  };

  const handleCancel2 = () => {
    setIsModalOpen2(false);
  };

  // const items = [
  //   {
  //     label: (

  //     ),
  //     key: "item-1",
  //   },
  // ];

  return (
    <div id={'topRightToogle'}>
      {/* <Dropdown
        menu={{ items }}
        trigger={["click"]}
        placement="bottomRight"
        overlayClassName="dropconnect-overlay"
        autoAdjustOverflow={false}
        getPopupContainer={() => document.getElementById("topRightToogle")}
      > */}
      <div className="connected_button" onClick={showModal2}>
        <Icon className={'bi bi-person-circle'} />
      </div>
      {/* </Dropdown> */}

      <Modal
        centered={true}
        className="modal__wallet__connect2"
        footer={null}
        header={null}
        open={isModalOpen2}
        width={550}
        onCancel={handleCancel2}
        onOk={handleOk2}
        closeIcon={<Icon className={'bi bi-x-lg'} />}
      >
        <div className="wallet-connect-dropdown text-left">
          <div className="wallet-connect-upper">
            {/* <span /> */}
            <div className="wallet-connect-tl">Account </div>
            <div className="wallet-connect-des">
              {`Connected with
              ${
                localStorage.getItem('loginType') === 'ledger'
                  ? 'Native-ledger'
                  : localStorage.getItem('loginType') === 'keplr'
                  ? 'Keplr'
                  : 'Leap Cosmos Wallet'
              }`}
            </div>
          </div>
          <div className="wallet-connect-wrap2">
            <div className="wallet-connect-up">
              <div className="wallet-connect-left">
                <div className="wallet-connect-logo">
                  {localStorage.getItem('loginType') === 'keplr' ? (
                    <div className={styles.dropdown__wallet__logo}>
                      <NextImage src={Keplr} alt="Keplr" />
                    </div>
                  ) : localStorage.getItem('loginType') === 'leap' ? (
                    <div className={styles.dropdown__wallet__logo}>
                      <NextImage src={Cosmos} alt="Keplr" />
                    </div>
                  ) : (
                    <div
                      className={`${styles.dropdown__wallet__logo} ${styles.active}`}
                    >
                      <NextImage
                        src={Ledger}
                        alt="Keplr"
                        className={styles.activeImage}
                      />
                    </div>
                  )}
                </div>
                <div className="wallet-connect-title2">{name}</div>
              </div>
              <div className="wallet-connect-wrap">
                <Button
                  type="primary"
                  onClick={showModal}
                  className="btn-filled3"
                  block
                  size="small"
                >
                  {variables[lang].disconnect}
                </Button>
              </div>
            </div>
            <div className="wallet-connect-down">
              <div>
                <div> {variables[lang].balance_wallet}</div>
                <div className="balance__value__data">
                  {amountConversionWithComma(
                    getDenomBalance(balances, comdex?.coinMinimalDenom) || 0
                  )}{' '}
                  {denomConversion(comdex?.coinMinimalDenom)}
                </div>
              </div>
              <div className="mt-2 px-3">
                <div>{variables[lang].address_wallet} </div>
                <div className="wallet-address">
                  <div className="address-wallet-address d-flex">
                    <span className="mr-3">
                      {' '}
                      {truncateString(address, 6, 6)}{' '}
                    </span>{' '}
                    <Copy text={address} />
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="px-3">
            <div> {variables[lang].balance_wallet}</div>
            <div className="balance__value__data">
              {amountConversionWithComma(
                getDenomBalance(balances, comdex?.coinMinimalDenom) || 0
              )}{' '}
              {denomConversion(comdex?.coinMinimalDenom)}
            </div>
          </div>
          <div className="mt-2 px-3">
            <div>{variables[lang].address_wallet} </div>
            <div className="wallet-address">
              <div className="address-wallet-address d-flex">
                <span className="mr-3"> {truncateString(address, 6, 6)} </span>{' '}
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
          </div>*/}
          </div>
        </div>
      </Modal>

      <Modal
        centered={true}
        className="connect-modal"
        footer={null}
        header={null}
        open={isModalOpen}
        width={550}
        onCancel={handleCancel}
        onOk={handleOk}
        closeIcon={<Icon className={'bi bi-x-lg'} />}
      >
        <div className="button__wrap">
          <h2> {variables[lang].disconnect_wallet}</h2>
          <div className="button__head">
            <Button
              type="primary"
              className="btn-filled mx-3"
              size="large"
              onClick={handleCancel}
              block
            >
              {variables[lang].no}
            </Button>
            <Button
              type="primary"
              className="mx-3"
              size="large"
              onClick={handleDisconnect}
              block
            >
              {variables[lang].yes}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
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
