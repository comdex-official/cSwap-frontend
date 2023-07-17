import { message, Spin } from 'antd';
import { encode } from 'js-base64';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  setAccountAddress,
  setAccountName,
  showAccountConnectModal,
} from '../../../actions/account';
import {
  fetchKeplrAccountName,
  initializeChain,
} from '../../../services/keplr';
import ButtonSubmit from './Ledger/index';
import styles from './Header.module.scss';
import { NextImage } from '../../image/NextImage';
import { Keplr, Wallet2, Cosmos, Ledger } from '../../image';

const ConnectModal = ({
  setAccountAddress,
  setAccountName,
  lang,
  showAccountConnectModal,
  handleCancel,
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

      localStorage.setItem('ac', encode(account.address));
      localStorage.setItem('loginType', walletType || 'keplr');
      showAccountConnectModal(false);
      handleCancel();
    });
  };

  return (
    <Spin spinning={inProgress}>
      <div className={styles.dropdown__wallet__menu}>
        <div className={styles.dropdown__wallet__wrap}>
          <div className={styles.dropdown__wallet__main}>
            <div className={styles.dropdown__wallet__title}>
              {'Connect Your Wallet'}
            </div>
            <div className={`${styles.dropdown__wallet__title} ${styles.span}`}>
              {'Select your wallet from the options to get started.'}
            </div>
          </div>
          <NextImage src={Wallet2} alt="Wallet" />
        </div>

        <div
          className={styles.dropdown__wallet__title__wrap}
          onClick={() => handleConnectToWallet('keplr')}
        >
          <div className={styles.dropdown__wallet__logo}>
            <NextImage src={Keplr} alt="Keplr" />
          </div>
          <div className={styles.dropdown__wallet__title2}>
            {'Keplr Wallet'}
          </div>
        </div>

        <div
          className={styles.dropdown__wallet__title__wrap}
          onClick={() => handleConnectToWallet('leap')}
        >
          <div className={styles.dropdown__wallet__logo}>
            <NextImage src={Cosmos} alt="Keplr" />
          </div>
          <div className={styles.dropdown__wallet__title2}>
            {'Leap Cosmos Wallet'}
          </div>
        </div>

        <div className={styles.dropdown__wallet__title__wrap}>
          <div className={`${styles.dropdown__wallet__logo} ${styles.active}`}>
            <NextImage
              src={Ledger}
              alt="Keplr"
              className={styles.activeImage}
            />
          </div>
          <div className={styles.dropdown__wallet__title2}>
            <ButtonSubmit handleCancel={handleCancel} />
          </div>
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
