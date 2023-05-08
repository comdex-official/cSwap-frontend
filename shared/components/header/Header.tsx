import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import styles from './Header.module.scss';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { toggleTheme } from '@/logic/redux/slices/themeSlice';
import { NextImage } from '@/shared/image/NextImage';
import { DotDropdownData, HeaderData, cSwapDropdownData } from './Data';
import { C_Logo, Faucet, Logo_Dark, Logo_Light } from '@/shared/image';
import { Icon } from '@/shared/image/Icon';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import Sidebar from '../sidebar/Sidebar';
import { message, Modal } from 'antd';
import { fetchKeplrAccountName, initializeChain } from "../../../services/keplr";
import { decode, encode } from "js-base64";
import { queryAllBalances } from "../../../services/bank/query";
import {
  setAccountAddress,
  setAccountBalances,
  setAccountName,
  setAssetBalance,
  showAccountConnectModal
} from "../../../logic/redux/account/account";

interface HeaderProps {
  setAccountAddress: any;
  setAccountBalances: any;
  address: String,
}

const Header = ({
  setAccountAddress,
  address,
  setAccountBalances,
}: HeaderProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const [inProgress, setInProgress] = useState(false);
  // const [address, setAddress] = useState()

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const [isOpen, setIsOpen] = useState({
    cSwap: false,
    wallet: false,
    dot: false,
  });

  const [mobileHam, setMobileHam] = useState<boolean>(false);

  const router = useRouter();

  const isActive = (pathname: string) => {
    return router.pathname === pathname;
  };

  const cSwapRef = useRef<any>();
  const walletRef = useRef<any>();
  const dotRef = useRef<any>();

  useOutsideClick({
    isOpen: isOpen.cSwap,
    node: cSwapRef,
    ids: ['cSwap'],
    onOutsideClick: () => setIsOpen({ ...isOpen, cSwap: false }),
  });

  useOutsideClick({
    isOpen: isOpen.wallet,
    node: walletRef,
    ids: ['wallet'],
    onOutsideClick: () => setIsOpen({ ...isOpen, wallet: false }),
  });

  useOutsideClick({
    isOpen: isOpen.dot,
    node: dotRef,
    ids: ['dot'],
    onOutsideClick: () => setIsOpen({ ...isOpen, dot: false }),
  });

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

  // console.log(address, "address reducer");


  const handleConnectToWallet = (walletType: string): void => {
    setInProgress(true);

    initializeChain(walletType, (error: any, account: any) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      // setAccountAddress(account.address);
      setAccountAddress(account.address)
      fetchKeplrAccountName().then((name: string) => {
        // setAccountName(name);
        console.log(name, "Keplr name");

      });

      localStorage.setItem("ac", encode(account.address));
      localStorage.setItem("loginType", walletType || "keplr");
      // showAccountConnectModal(false);
    });
  };

  const fetchBalances = useCallback(
    (address: String) => {
      queryAllBalances(address, (error: any, result: any) => {
        if (error) {
          console.log(error, "error in balance ");
          return;
        }
        console.log(result, "result Balance");

        console.log(result.balances, "Balance");

        setAccountBalances(result.balances, result.pagination);
        // calculateAssetBalance(result.balances);
      });
    },
    // [calculateAssetBalance, setAccountBalances]
    []
  );

  useEffect(() => {
    console.log(address, "address");
    if (address) {

      fetchBalances(address);
    }
    // }, [address, refreshBalance, markets, fetchBalances]);
  }, [address, fetchBalances]);

  return (
    <div className={styles.header__wrap}>
      <div className={styles.header__main}>
        <div
          className={styles.hamburger}
          onClick={() => setMobileHam(!mobileHam)}
        >
          <Icon
            className={`bi bi-list ${theme === 'dark' ? styles.icon_dark : styles.icon_light
              }`}
            size={'1.5rem'}
          />
        </div>

        <div className={styles.header__left}>
          <div className={styles.header__logo} onClick={() => router.push('/')}>
            {theme === 'dark' ? (
              <NextImage src={Logo_Dark} alt="Logo_Dark" />
            ) : (
              <NextImage src={Logo_Light} alt="Logo_Dark" />
            )}
          </div>
          {HeaderData.map((item, i) => (
            <div
              key={item.id}
              className={`${styles.header__left__element} ${theme === 'dark' ? styles.dark : styles.light
                } ${isActive(item.route) ? styles.active : ''}`}
            >
              <Link
                href={i === 6 ? '' : item.route}
                onClick={() => i === 6 && showModal()}
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <Modal
          className={'modal__wrap'}
          title="Bridge"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <iframe
            src="https://dev-transit.comdex.one/"
            frameBorder="0"
            width={'100%'}
            height={'580px'}
            style={{ borderRadius: '10px', background: '#030b1e' }}
          ></iframe>
        </Modal>

        <div className={styles.dropdown}>
          <div className={styles.header__right}>
            <div
              id="cSwap"
              className={styles.header__cSwap}
              onClick={() => setIsOpen({ ...isOpen, cSwap: !isOpen.cSwap })}
            >
              <div className={styles.header__cSwap__main}>
                {theme === 'dark' ? (
                  <NextImage src={C_Logo} alt="Logo_Dark" />
                ) : (
                  <NextImage src={C_Logo} alt="Logo_Dark" />
                )}

                <div
                  className={`${styles.header__cSwap__title} ${theme === 'dark' ? styles.dark : styles.light
                    }`}
                >
                  {'cSwap'}
                </div>
              </div>
              <Icon
                className={`bi bi-grid-fill ${theme === 'dark' ? styles.icon_dark : styles.icon_light
                  }`}
              />
            </div>

            <div className={styles.header__faucet}>
              <NextImage src={Faucet} alt="Logo_Dark" />
              <div
                className={`${styles.header__faucet__title} ${theme === 'dark' ? styles.dark : styles.light
                  }`}
              >
                {'Faucet'}
              </div>
            </div>
            <div
              id="wallet"
              className={styles.header__wallet}
              onClick={() => setIsOpen({ ...isOpen, wallet: !isOpen.wallet })}
            >
              <div
                className={`${styles.header__wallet__title} ${theme === 'dark' ? styles.dark : styles.light
                  }`}
              >
                {'Connect Wallet'}
              </div>
            </div>
            <Icon
              id="dot"
              className={`bi bi-three-dots-vertical ${theme === 'dark' ? styles.icon_dark : styles.icon_light
                }`}
              size={'2rem'}
              onClick={() => setIsOpen({ ...isOpen, dot: !isOpen.dot })}
            />

            {isOpen.cSwap && (
              <div className={styles.dropdown__cSwap__menu} ref={cSwapRef}>
                {cSwapDropdownData.map((item) => (
                  <button key={item.id}>{item.name}</button>
                ))}
              </div>
            )}

            {isOpen.wallet && (
              <div className={styles.dropdown__wallet__menu} ref={walletRef}>
                <div className={styles.dropdown__wallet__title}>
                  {' Connect Wallet'}
                </div>
                <button onClick={() => handleConnectToWallet("keplr")}>{'Keplr Wallet'}</button>
              </div>
            )}

            {isOpen.dot && (
              <div className={styles.dropdown__dot__menu} ref={dotRef}>
                {DotDropdownData.map((item) => (
                  <div key={item.id} className={styles.dropdown__dot__item}>
                    <Link href="#">
                      <div>
                        <Icon
                          className={`${item.icon} ${theme === 'dark'
                            ? styles.icon_dark
                            : styles.icon_light
                            }`}
                        />
                      </div>
                      <div>{item.name}</div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Sidebar isOpen={mobileHam} setIsOpen={setMobileHam} />
          </div>
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
  // lang: PropTypes.string.isRequired,
  // refreshBalance: PropTypes.number.isRequired,
  setAccountAddress: PropTypes.func.isRequired,
  // showAccountConnectModal: PropTypes.func.isRequired,
  setAccountBalances: PropTypes.func.isRequired,
  // setAccountName: PropTypes.func.isRequired,
  // setAssetBalance: PropTypes.func.isRequired,
  // setAssetsInPrgoress: PropTypes.func.isRequired,
  // setAssets: PropTypes.func.isRequired,
  // setAppAssets: PropTypes.func.isRequired,
  // setMarkets: PropTypes.func.isRequired,
  // setParams: PropTypes.func.isRequired,
  // setPoolIncentives: PropTypes.func.isRequired,
  // setPoolRewards: PropTypes.func.isRequired,
  address: PropTypes.string,
  // assetMap: PropTypes.object,
  // assetDenomMap: PropTypes.object,
  // balances: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     denom: PropTypes.string.isRequired,
  //     amount: PropTypes.string,
  //   })
  // ),
  // markets: PropTypes.object,
  // pools: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     id: PropTypes.shape({
  //       high: PropTypes.number,
  //       low: PropTypes.number,
  //       unsigned: PropTypes.bool,
  //     }),
  //     reserveAccountAddress: PropTypes.string,
  //     poolCoinDenom: PropTypes.string,
  //     reserveCoinDenoms: PropTypes.array,
  //   })
  // ),
  // show: PropTypes.bool,
};

const stateToProps = (state: any) => {
  return {
    // lang: state.language,
    address: state.account.account.address,
    // show: state.account.showModal,
    // markets: state.oracle.market.list,
    // refreshBalance: state.account.refreshBalance,
    // pools: state.liquidity.pool.list,
    // balances: state.account.balances.list,
    // assetMap: state.asset.map,
    // assetDenomMap: state.asset._.assetDenomMap,
  };
};

const actionsToProps = {
  // showAccountConnectModal,
  setAccountAddress,
  setAccountBalances,
  // setAssetBalance,
  // setMarkets,
  // setAccountName,
  // setPoolIncentives,
  // setPoolRewards,
  // setParams,
  // setAssets,
  // setAppAssets,
  // setAssetsInPrgoress,
};

// export default Header;

export default connect(stateToProps, actionsToProps)(Header);