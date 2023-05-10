import Lodash from 'lodash';
import styles from './Header.module.scss';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { toggleTheme } from '@/logic/redux/slices/themeSlice';
import { NextImage } from '@/shared/image/NextImage';
import { DotDropdownData, HeaderData } from './Data';
import {
  C_Logo,
  Comodo,
  Faucet,
  Harbor,
  Logo_Dark,
  Logo_Light,
} from '@/shared/image';
import { Icon } from '@/shared/image/Icon';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import Sidebar from '../sidebar/Sidebar';
import { message, Modal } from 'antd';
import {
  fetchKeplrAccountName,
  initializeChain,
} from '../../../services/keplr';
import { decode, encode } from 'js-base64';
import { queryAllBalances } from '../../../services/bank/query';
import { queryAssets } from '../../../services/asset/query';

import {
  fetchAllTokens,
  fetchRestAPRs,
  queryLiquidityParams,
  queryPoolIncentives,
} from '../../../services/liquidity/query';

import { fetchRestPrices } from '../../../services/oracle/query';

import MyDropdown from '../dropDown/Dropdown';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/common';
import { marketPrice } from '@/utils/number';
import { cmst, harbor } from '@/config/network';
import { amountConversion } from '@/utils/coin';
import {
  setAccountAddress,
  setAccountBalances,
  setAccountName,
  setAssetBalance,
} from '@/logic/redux/slices/accountSlice';
import { truncateString } from '@/utils/string';
import { setMarkets } from '@/logic/redux/oracle';

interface HeaderProps { }

const Header = ({ }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const comdex = useAppSelector((state) => state.config.config);
  const account = useAppSelector((state) => state.account);
  const markets = useAppSelector((state) => state.oracle.market.list);

  const [addressFromLocal, setAddressFromLocal] = useState<any>();
  const [inProgress, setInProgress] = useState(false);
  const [assetsInPrgoress, setAssetsInPrgoress] = useState<any>();
  const [assetMap, setAppAssets] = useState<any>();
  // const [markets, setMarkets] = useState<any>();
  const [assetDenomMap, setAssets] = useState<any>({});

  console.log({ account });

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const [mobileHam, setMobileHam] = useState<boolean>(false);

  const router = useRouter();

  const isActive = (pathname: string) => {
    return router.pathname === pathname;
  };

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

  const handleConnectToWallet = (walletType: any) => {
    setInProgress(true);

    initializeChain(walletType, (error: any, account: any) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      dispatch(setAccountAddress(account.address));
      fetchKeplrAccountName().then((name: any) => {
        dispatch(setAccountName(name));
      });

      localStorage.setItem('ac', encode(account.address));
      localStorage.setItem('loginType', walletType || 'keplr');
      // showAccountConnectModal(false);
    });
  };

  const subscription = {
    jsonrpc: '2.0',
    method: 'subscribe',
    id: '0',
    params: {
      query: `coin_spent.spender='${account.address}'`,
    },
  };
  const subscription2 = {
    jsonrpc: '2.0',
    method: 'subscribe',
    id: '0',
    params: {
      query: `coin_received.receiver='${account.address}'`,
    },
  };

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
      initializeChain(walletType, (error: any, account: any) => {
        if (error) {
          message.error(error);
          return;
        }
        // setAccountAddress(account.address);
        dispatch(setAccountAddress(account.address));

        fetchKeplrAccountName().then((name: any) => {
          dispatch(setAccountName(name));
        });
        localStorage.setItem('ac', encode(account.address));
        localStorage.setItem('loginType', walletType || 'keplr');
      });
    }
  }, [addressFromLocal, setAccountAddress, setAccountName]);

  // useEffect(() => {
  //   if (account.address) {
  //     let ws = new WebSocket(`${comdex?.webSocketApiUrl}`);

  //     ws.onopen = () => {
  //       ws.send(JSON.stringify(subscription));
  //       ws.send(JSON.stringify(subscription2));
  //     };

  //     ws.onmessage = (event) => {
  //       const response = JSON.parse(event.data);
  //       if (response?.result?.events) {
  //         const savedAddress = localStorage.getItem('ac');
  //         const userAddress = savedAddress
  //           ? decode(savedAddress)
  //           : account.address;
  //         fetchBalances(userAddress);
  //       }
  //     };

  //     ws.onclose = () => {
  //       console.log('Connection Closed! 0');
  //     };

  //     ws.onerror = (error) => {
  //       console.log(error, 'WS Error');
  //     };
  //   }
  // }, [account.address]);

  useEffect(() => {
    const savedAddress = localStorage.getItem('ac');
    const userAddress: any = savedAddress
      ? decode(savedAddress)
      : account.address;

    if (userAddress) {
      dispatch(setAccountAddress(userAddress));

      fetchKeplrAccountName().then((name: any) => {
        dispatch(setAccountName(name));
      });
    }
  }, [account.address, setAccountAddress, setAccountName]);

  const getPrice = useCallback(
    (denom: any) => {
      return marketPrice(markets, denom) || 0;
    },
    [markets]
  );

  const calculateAssetBalance = useCallback(
    (balances: any) => {
      console.log({ balances });

      const assetBalances = balances.filter(
        (item: any) =>
          item.denom.substr(0, 4) === 'ibc/' ||
          item.denom === comdex.coinMinimalDenom ||
          item.denom === cmst.coinMinimalDenom ||
          item.denom === harbor.coinMinimalDenom
      );

      const value = assetBalances.map((item: any) => {
        return (
          getPrice(item.denom) *
          +amountConversion(item.amount, assetMap[item?.denom]?.decimals)
        );
      });
      //@ts-ignore
      dispatch(setAssetBalance(Lodash.sum(value)));
    },
    [getPrice, setAssetBalance, assetMap]
  );

  const fetchBalances = useCallback(
    (address: any) => {
      queryAllBalances(address, (error: any, result: any) => {
        if (error) {
          return;
        }

        console.log({ result });

        dispatch(setAccountBalances(result.balances));

        calculateAssetBalance(result.balances);
      });
    },
    [calculateAssetBalance, setAccountBalances]
  );

  useEffect(() => {
    if (account.address) {
      fetchBalances(account.address);
    }
  }, [account.address, markets, fetchBalances]);

  // useEffect(() => {
  //   calculateAssetBalance(balances);
  // }, [balances, calculateAssetBalance]);

  useEffect(() => {
    if (!Object.keys(assetDenomMap)?.length) {
      setAssetsInPrgoress(true);
      fetchAllTokens((error: any, result: any) => {
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
    fetchRestPrices((error: any, result: any) => {
      if (error) {
        message.error(error);
        return;
      }

      console.log(result, "market data");


      dispatch(setMarkets(result.data));
    });
  }, [setMarkets]);

  const fetchAssets = useCallback(
    (offset: any, limit: any, countTotal: any, reverse: any) => {
      queryAssets(
        offset,
        limit,
        countTotal,
        reverse,
        (error: any, data: any) => {
          if (error) {
            message.error(error);
            return;
          }

          setAssets(data.assets);
        }
      );
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

  // const fetchParams = useCallback(() => {
  //   queryLiquidityParams((error:any, result:any) => {
  //     if (error) {
  //       message.error(error);
  //       return;
  //     }

  //     if (result?.params) {
  //       setParams(result?.params);
  //     }
  //   });
  // }, [setParams]);

  // const fetchPoolIncentives = useCallback(() => {
  //   queryPoolIncentives((error:any, result:any) => {
  //     if (error) {
  //       message.error(error);
  //       return;
  //     }

  //     setPoolIncentives(result?.poolIncentives);
  //   });
  // }, [setPoolIncentives]);

  // const getAPRs = useCallback(() => {
  //   fetchRestAPRs((error:any, result:any) => {
  //     if (error) {
  //       message.error(error);
  //       return;
  //     }

  //     setPoolRewards(result?.data);
  //   });
  // }, [setPoolRewards]);

  // useEffect(() => {
  //   fetchPoolIncentives();
  //   fetchParams();
  //   getAPRs();
  // }, [fetchParams, fetchPoolIncentives, getAPRs]);

  const cswapItems = [
    {
      key: '1',
      label: (
        <div className={styles.dropdown__cSwap__menu}>
          <button>
            <NextImage src={Harbor} alt="Logo" />
          </button>
          <button>
            <NextImage src={Comodo} alt="Logo" />
          </button>
        </div>
      ),
    },
  ];

  const handleDisconnect = () => {
    //@ts-ignore
    setAccountAddress('');
    localStorage.removeItem('ac');
    localStorage.removeItem('loginType');
    window.location.reload();
  };

  const walletItems = [
    {
      key: '1',
      label: account.address ? (
        <div className={styles.dropdown__wallet__menu}>
          <div className={styles.dropdown__wallet__title}>
            {`Name: ${account.accountName}`}
          </div>
          <div className={styles.dropdown__wallet__title}>
            {`Balance: ${account.balances.list}`}
          </div>
          <div className={styles.dropdown__wallet__title}>
            {`Account: ${truncateString(account.address, 6, 6)}`}
          </div>

          <button onClick={() => handleDisconnect()}>{'Disconnect'}</button>
        </div>
      ) : (
        <div className={styles.dropdown__wallet__menu}>
          <div className={styles.dropdown__wallet__title}>
            {' Connect Wallet'}
          </div>
          <button onClick={() => handleConnectToWallet('keplr')}>
            {'Keplr Wallet'}
          </button>
          <button onClick={() => handleConnectToWallet('leap')}>
            {'Leap Cosmos Wallet'}
          </button>
          <button>{'Ledger'}</button>
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
              <Link href="#">
                <div>
                  <NextImage src={item.icon} alt="Icon" />
                </div>
                <div>{item.name}</div>
              </Link>
            </div>
          ))}
        </div>
      ),
    },
  ];

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
            <MyDropdown items={cswapItems} placement={'bottomLeft'}>
              <div className={styles.header__cSwap}>
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
                  <Icon
                    className={`bi bi-grid-fill ${theme === 'dark' ? styles.icon_dark : styles.icon_light
                      }`}
                  />
                </div>
                <Icon
                  className={`bi bi-grid-fill ${theme === 'dark' ? styles.icon_dark : styles.icon_light
                    }`}
                />
              </div>
            </MyDropdown>
            <div className={styles.header__faucet}>
              <NextImage src={Faucet} alt="Logo_Dark" />
              <div
                className={`${styles.header__faucet__title} ${theme === 'dark' ? styles.dark : styles.light
                  }`}
              >
                {'Faucet'}
              </div>
            </div>

            <MyDropdown items={walletItems} placement={'bottomLeft'}>
              <div className={styles.header__wallet}>
                <div
                  className={`${styles.header__wallet__title} ${theme === 'dark' ? styles.dark : styles.light
                    }`}
                >
                  {`${account.address
                    ? truncateString(account.address, 6, 6)
                    : 'Connect Wallet'
                    }`}
                </div>
              </div>
            </MyDropdown>

            <MyDropdown items={threeDotItems} placement={'bottomLeft'}>
              <div>
                <Icon
                  className={`bi bi-three-dots-vertical ${theme === 'dark' ? styles.icon_dark : styles.icon_light
                    }`}
                  size={'2rem'}
                />
              </div>
            </MyDropdown>

            <Sidebar isOpen={mobileHam} setIsOpen={setMobileHam} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
