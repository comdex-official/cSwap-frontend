import styles from './Header.module.scss';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NextImage } from '../../../shared/image/NextImage';
import { DotDropdownData, HeaderData, cSwapDropdownData } from './Data';
import Lodash from 'lodash';
import {
  C_Logo,
  Comodo,
  Faucet,
  Harbor,
  Hyperlink,
  Logo_Dark,
  Logo_Light,
  Shop,
  Wallet,
} from '../../../shared/image';
import { Icon } from '../../../shared/image/Icon';
import Link from 'next/link';
import Sidebar from '../sidebar/Sidebar';
import { decode, encode } from 'js-base64';
import {
  fetchKeplrAccountName,
  initializeChain,
} from '../../../services/keplr';
import { Dropdown, Modal, message } from 'antd';
import { marketPrice } from '../../../utils/number';
import { cmst, comdex, harbor } from '../../../config/network';
import { amountConversion } from '../../../utils/coin';
import { queryAllBalances } from '../../../services/bank/query';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  NETWORK_TAG,
} from '../../../constants/common';
import ConnectModal from './ConnectModal';
import variables from '../../../utils/variables';
import {
  fetchAllTokens,
  fetchRestAPRs,
  queryLiquidityParams,
  queryPoolIncentives,
} from '../../../services/liquidity/query.js';
import { fetchRestPrices } from '../../../services/oracle/query';
import {
  envConfigResult,
  ibcAssets,
  queryAssets,
  inconsResult,
} from '../../../services/asset/query';
import {
  setAccountAddress,
  setAccountBalances,
  setAccountName,
  setAssetBalance,
  showAccountConnectModal,
} from '../../../actions/account';
import {
  setAppAssets,
  setAssets,
  setAssetsInPrgoress,
} from '../../../actions/asset.js';
import {
  setEnvConfig,
  setAssetList,
  setIconList,
} from '../../../actions/config';
import { setPoolIncentives, setPoolRewards } from '../../../actions/liquidity';
import { setMarkets } from '../../../actions/oracle';
import { setParams } from '../../../actions/swap';
import { useRouter } from 'next/router';
import DisconnectModal from './DisconnectModal';
import MyDropdown from '../dropDown/Dropdown';

const Header = ({
  setAccountAddress,
  address,
  setAccountBalances,
  lang,
  setAssetBalance,
  markets,
  refreshBalance,
  setMarkets,
  setAccountName,
  setPoolIncentives,
  setPoolRewards,
  setParams,
  balances,
  setAssets,
  setAppAssets,
  assetMap,
  setAssetsInPrgoress,
  assetDenomMap,
  setAssetList,
  setIconList,
  setEnvConfig,
}) => {
  const theme = 'dark';

  const [mobileHam, setMobileHam] = useState(false);

  const router = useRouter();
  const headerRef = useRef(null);
  const isActive = (pathname) => {
    return router.pathname === pathname;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window?.scrollY > 0;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [addressFromLocal, setAddressFromLocal] = useState();

  const subscription = {
    jsonrpc: '2.0',
    method: 'subscribe',
    id: '0',
    params: {
      query: `coin_spent.spender='${address}'`,
    },
  };
  const subscription2 = {
    jsonrpc: '2.0',
    method: 'subscribe',
    id: '0',
    params: {
      query: `coin_received.receiver='${address}'`,
    },
  };

  useEffect(() => {
    envConfigResult()
      .then((result) => {
        setEnvConfig(result?.envConfig);
      })
      .catch((err) => {
        console.log(err);
      });

    ibcAssets()
      .then((result) => {
        setAssetList(result);
      })
      .catch((err) => {
        console.log(err);
      });

    inconsResult()
      .then((result) => {
        setIconList(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    let addressAlreadyExist = localStorage.getItem('ac');
    addressAlreadyExist = addressAlreadyExist
      ? decode(addressAlreadyExist)
      : '';
    setAddressFromLocal(addressAlreadyExist);
  }, []);

  useEffect(() => {
    let walletType = localStorage.getItem('loginType');

    if (addressFromLocal) {
      initializeChain(walletType, (error, account) => {
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
      });
    }
  }, [addressFromLocal, setAccountAddress, setAccountName]);

  // useEffect(() => {
  //   if (address) {
  //     let ws = new WebSocket(`${comdex?.webSocketApiUrl}`);

  //     ws.onopen = () => {
  //       ws.send(JSON.stringify(subscription));
  //       ws.send(JSON.stringify(subscription2));
  //     };

  //     ws.onmessage = (event) => {
  //       const response = JSON.parse(event.data);
  //       if (response?.result?.events) {
  //         const savedAddress = localStorage.getItem("ac");
  //         const userAddress = savedAddress ? decode(savedAddress) : address;
  //         fetchBalances(userAddress);
  //       }
  //     };

  //     ws.onclose = () => {
  //       console.log("Connection Closed! 0");
  //     };

  //     ws.onerror = (error) => {
  //       console.log(error, "WS Error");
  //     };
  //   }
  // }, [address]);

  useEffect(() => {
    const savedAddress = localStorage.getItem('ac');
    const userAddress = savedAddress ? decode(savedAddress) : address;

    if (userAddress) {
      setAccountAddress(userAddress);

      fetchKeplrAccountName().then((name) => {
        setAccountName(name);
      });
    }
  }, [address, refreshBalance, setAccountAddress, setAccountName]);

  const getPrice = useCallback(
    (denom) => {
      return marketPrice(markets, denom) || 0;
    },
    [markets]
  );

  const calculateAssetBalance = useCallback(
    (balances) => {
      const assetBalances = balances.filter(
        (item) =>
          item.denom.substr(0, 4) === 'ibc/' ||
          item.denom === comdex.coinMinimalDenom ||
          item.denom === cmst.coinMinimalDenom ||
          item.denom === harbor.coinMinimalDenom
      );

      const value = assetBalances.map((item) => {
        return (
          getPrice(item.denom) *
          amountConversion(item.amount, assetMap[item?.denom]?.decimals)
        );
      });

      setAssetBalance(Lodash.sum(value));
    },
    [getPrice, setAssetBalance, assetMap]
  );

  const fetchBalances = useCallback(
    (address) => {
      queryAllBalances(address, (error, result) => {
        if (error) {
          return;
        }
        setAccountBalances(result.balances, result.pagination);
        calculateAssetBalance(result.balances);
      });
    },
    [calculateAssetBalance, setAccountBalances]
  );

  useEffect(() => {
    if (address) {
      fetchBalances(address);
    }
  }, [address, refreshBalance, markets, fetchBalances]);

  useEffect(() => {
    calculateAssetBalance(balances);
  }, [balances, calculateAssetBalance]);

  useEffect(() => {
    if (!Object.keys(assetDenomMap)?.length) {
      setAssetsInPrgoress(true);
      fetchAllTokens((error, result) => {
        if (error) {
          return;
        }

        if (result?.data?.length) {
          setAppAssets(result?.data);
        }
      });
    }
  }, [setAppAssets, assetDenomMap, setAssetsInPrgoress]);

  const fetchPrices = useCallback(() => {
    fetchRestPrices((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setMarkets(result.data);
    });
  }, [setMarkets]);

  const fetchAssets = useCallback(
    (offset, limit, countTotal, reverse) => {
      queryAssets(offset, limit, countTotal, reverse, (error, data) => {
        if (error) {
          message.error(error);
          return;
        }

        setAssets(data.assets);
      });
    },
    [setAssets]
  );

  useEffect(() => {
    fetchPrices();
    fetchAssets(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE * 10, // taking 100 records
      true,
      false
    );
  }, [fetchAssets, fetchPrices]);

  const fetchParams = useCallback(() => {
    queryLiquidityParams((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      if (result?.params) {
        setParams(result?.params);
      }
    });
  }, [setParams]);

  const fetchPoolIncentives = useCallback(() => {
    queryPoolIncentives((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setPoolIncentives(result?.poolIncentives);
    });
  }, [setPoolIncentives]);

  const getAPRs = useCallback(() => {
    fetchRestAPRs((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setPoolRewards(result?.data);
    });
  }, [setPoolRewards]);

  useEffect(() => {
    fetchPoolIncentives();
    fetchParams();
    getAPRs();
  }, [fetchParams, fetchPoolIncentives, getAPRs]);

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

  const items = [{ label: <ConnectModal />, key: 'item-1' }];

  const cswapItems = [
    {
      key: 'item-2',
      label: (
        <div className={styles.dropdown__cSwap__menu}>
          <button
            onClick={() =>
              window.open('https://app.harborprotocol.one/', '_blank')
            }
          >
            <NextImage src={Harbor} alt="Logo" />
          </button>
          <button
            onClick={() => window.open('https://app.commodo.one/', '_blank')}
          >
            <NextImage src={Comodo} alt="Logo" />
          </button>
        </div>
      ),
    },
  ];

  const threeDotItems = [
    {
      key: '1',
      label: (
        <div className={styles.dropdown__dot__menu}>
          {DotDropdownData.map((item) => (
            <div key={item.id} className={styles.dropdown__dot__item}>
              <a href={item.link} target="_blank">
                <div>
                  <NextImage src={item.icon} alt="Icon" />
                </div>
                <div className={styles.right__item}>{item.name}</div>
              </a>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 200) {
      setVisible(true);
    } else if (scrolled <= 200) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  window.addEventListener('scroll', toggleVisible);

  return (
    <div
      className={`${styles.header__wrap} ${
        scrolled ? styles.header__bg : ''
      } dark`}
      ref={headerRef}
    >
      <div className={styles.header__main}>
        <div
          className={styles.hamburger}
          onClick={() => setMobileHam(!mobileHam)}
        >
          <Icon
            className={`bi bi-list ${
              theme === 'dark' ? styles.icon_dark : styles.icon_light
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
        </div>

        <div className={styles.header__title__section}>
          {HeaderData.map((item, i) => (
            <div
              key={item.id}
              className={`${styles.header__left__element} ${
                theme === 'dark' ? styles.dark : styles.light
              } ${isActive(item.route) ? styles.active : ''}`}
            >
              <div
                className={styles.header__name}
                onClick={() =>
                  item?.id === 5 ? showModal() : router.push(item.route)
                }
              >
                {item.name}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.dropdown}>
          <div className={styles.header__right} id="topRightToogle">
            <MyDropdown
              items={cswapItems}
              placement={'bottomLeft'}
              trigger={['click']}
              className={'header_cswap'}
              getPopupContainer={() =>
                document.getElementById('topRightToogle')
              }
            >
              <div className={styles.header__cSwap}>
                {/* <div className={styles.header__cSwap__main}>
                  {theme === 'dark' ? (
                    <NextImage src={C_Logo} alt="Logo_Dark" />
                  ) : (
                    <NextImage src={C_Logo} alt="Logo_Dark" />
                  )}

                  <div
                    className={`${styles.header__cSwap__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'cSwap'}
                  </div>
                </div> */}
                <Icon
                  className={`bi bi-grid-fill ${
                    theme === 'dark' ? styles.icon_dark : styles.icon_light
                  }`}
                  size={'1.1rem'}
                />
              </div>
            </MyDropdown>

            <div
              className={styles.header__cSwap}
              onClick={() =>
                window.open('https://faucet.comdex.one/', '_blank')
              }
            >
              <div className={styles.header__cSwap__main}>
                {theme === 'dark' ? (
                  <NextImage src={Faucet} alt="Logo_Dark" />
                ) : (
                  <NextImage src={Faucet} alt="Logo_Dark" />
                )}

                {/* <div
                  className={`${styles.header__cSwap__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Faucet'}
                </div> */}
              </div>
              {/* <NextImage src={Hyperlink} alt={'Logo'} height={15} width={15} /> */}
            </div>

            <div className={styles.header__buy}>
              {/* <div
                className={`${styles.header__buy__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Buy'}
              </div> */}
              <NextImage src={Shop} alt={'Logo'} />
            </div>

            <div id={'topRightToogle3'}>
              <MyDropdown
                items={threeDotItems}
                placement={'bottomRight'}
                trigger={['click']}
                getPopupContainer={() =>
                  document.getElementById('topRightToogle3')
                }
              >
                <div className={styles.header__dot}>
                  <Icon
                    className={`bi bi-three-dots-vertical cursor ${
                      theme === 'dark' ? styles.icon_dark : styles.icon_light
                    }`}
                    size={'1.2rem'}
                  />
                </div>
              </MyDropdown>
            </div>

            {address ? (
              <div className="connected_div">
                <div className="connected_left">
                  <div className="testnet-top">{NETWORK_TAG || 'Testnet'}</div>
                </div>
                <DisconnectModal />
              </div>
            ) : (
              <div id="topRightToogle2" onClick={showModal2}>
                {/* <Dropdown
                  menu={{ items }}
                  placement="bottomRight"
                  trigger={['click']}
                  overlayClassName="dropconnect-overlay"
                  getPopupContainer={() =>
                    document.getElementById('topRightToogle2')
                  }
                  autoAdjustOverflow={false}
                > */}

                <div className={styles.header__wallet}>
                  {variables[lang]?.connect}
                  <NextImage src={Wallet} alt={'Wallet'} />
                </div>
                {/* </Dropdown> */}
              </div>
            )}

            <Sidebar isOpen={mobileHam} setIsOpen={setMobileHam} />
          </div>
        </div>

        <div
          className="top-div"
          onClick={scrollToTop}
          style={{ display: visible ? '' : 'none' }}
        >
          <Icon className={`bi bi-chevron-up cursor`} size={'1.5rem'} />
        </div>

        <Modal
          className={'modal__wallet__connect'}
          open={isModalOpen2}
          onOk={handleOk2}
          onCancel={handleCancel2}
          centered={true}
          footer={null}
          header={null}
        >
          <ConnectModal handleCancel={handleCancel2} />
        </Modal>

        <Modal
          className={'modal__wrap'}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          centered={true}
          footer={null}
          header={null}
        >
          <iframe
            src="https://dev-transit.comdex.one/"
            frameBorder="0"
            width={'100%'}
            height={'700px'}
            style={{ borderRadius: '10px', background: '#030b1e' }}
          ></iframe>
        </Modal>
      </div>
    </div>
  );
};

Header.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  setAccountAddress: PropTypes.func.isRequired,
  showAccountConnectModal: PropTypes.func.isRequired,
  setAccountBalances: PropTypes.func.isRequired,
  setAccountName: PropTypes.func.isRequired,
  setAssetBalance: PropTypes.func.isRequired,
  setAssetsInPrgoress: PropTypes.func.isRequired,
  setAssets: PropTypes.func.isRequired,
  setAppAssets: PropTypes.func.isRequired,
  setMarkets: PropTypes.func.isRequired,
  setParams: PropTypes.func.isRequired,
  setPoolIncentives: PropTypes.func.isRequired,
  setPoolRewards: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  assetDenomMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  pools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      reserveAccountAddress: PropTypes.string,
      poolCoinDenom: PropTypes.string,
      reserveCoinDenoms: PropTypes.array,
    })
  ),
  show: PropTypes.bool,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    show: state.account.showModal,
    markets: state.oracle.market.list,
    refreshBalance: state.account.refreshBalance,
    pools: state.liquidity.pool.list,
    balances: state.account.balances.list,
    assetMap: state.asset.map,
    assetDenomMap: state.asset._.assetDenomMap,
  };
};

const actionsToProps = {
  showAccountConnectModal,
  setAccountAddress,
  setAccountBalances,
  setAssetBalance,
  setMarkets,
  setAccountName,
  setPoolIncentives,
  setPoolRewards,
  setParams,
  setAssets,
  setAppAssets,
  setAssetsInPrgoress,
  setAssetList,
  setIconList,
  setEnvConfig,
};

export default connect(stateToProps, actionsToProps)(Header);
