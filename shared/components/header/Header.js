"use client";
import styles from "./Header.module.scss";
import React, { useCallback, useEffect, useState, useRef } from "react";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { NextImage } from "../../../shared/image/NextImage";
import { DotDropdownData, HeaderData, cSwapDropdownData } from "./Data";
import { C_Logo, Faucet, Logo_Dark, Logo_Light } from "../../../shared/image";
import { Icon } from "../../../shared/image/Icon";
import Link from "next/link";
import Sidebar from "../sidebar/Sidebar";
import { decode, encode } from "js-base64";
import {
  fetchKeplrAccountName,
  initializeChain,
} from "../../../services/keplr";
import { Dropdown, Modal, message } from "antd";
import { marketPrice } from "../../../utils/number";
import { cmst, comdex, harbor } from "../../../config/network";
import { amountConversion } from "../../../utils/coin";
import { queryAllBalances } from "../../../services/bank/query";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../../../constants/common";
import ConnectModal from "./ConnectModal";
import variables from "../../../utils/variables";
import {
  fetchAllTokens,
  fetchRestAPRs,
  queryLiquidityParams,
  queryPoolIncentives,
} from "../../../services/liquidity/query.js";
import { fetchRestPrices } from "../../../services/oracle/query";
import { envConfigResult, ibcAssets, queryAssets } from "../../../services/asset/query";
import {
  setAccountAddress,
  setAccountBalances,
  setAccountName,
  setAssetBalance,
  showAccountConnectModal,
} from "../../../actions/account";
import {
  setAppAssets,
  setAssets,
  setAssetsInPrgoress,
} from "../../../actions/asset.js";
import { setEnvConfig, setAssetList } from '../../../actions/config';
import { setPoolIncentives, setPoolRewards } from "../../../actions/liquidity";
import { setMarkets } from "../../../actions/oracle";
import { setParams } from "../../../actions/swap";
import { useRouter } from "next/navigation";
import DisconnectModal from "./DisconnectModal";

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
  setEnvConfig
}) => {
  const theme = "darkssss";

  const [mobileHam, setMobileHam] = useState(false);

  const router = useRouter();

  const isActive = (pathname) => {
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

  const [addressFromLocal, setAddressFromLocal] = useState();

  const subscription = {
    jsonrpc: "2.0",
    method: "subscribe",
    id: "0",
    params: {
      query: `coin_spent.spender='${address}'`,
    },
  };
  const subscription2 = {
    jsonrpc: "2.0",
    method: "subscribe",
    id: "0",
    params: {
      query: `coin_received.receiver='${address}'`,
    },
  };

  useEffect(() => {
    envConfigResult().then((result) => {
      setEnvConfig(result?.envConfig)
    })
      .catch((err) => {
        console.log(err);
      });

    ibcAssets()
      .then((result) => {
        setAssetList(result)
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  useEffect(() => {
    let addressAlreadyExist = localStorage.getItem("ac");
    addressAlreadyExist = addressAlreadyExist
      ? decode(addressAlreadyExist)
      : "";
    setAddressFromLocal(addressAlreadyExist);
  }, []);

  useEffect(() => {
    let walletType = localStorage.getItem("loginType");

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
        localStorage.setItem("ac", encode(account.address));
        localStorage.setItem("loginType", walletType || "keplr");
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
    const savedAddress = localStorage.getItem("ac");
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
          item.denom.substr(0, 4) === "ibc/" ||
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

      // setAssetBalance(Lodash.sum(value));
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

  // const items = [{ label: <ConnectModal />, key: "item-1" }];
  const items = [{ lable: <h1>Hello</h1>, key: 1 }]

  return (
    <div className={styles.header__wrap}>
      <div className={styles.header__main}>
        <div
          className={styles.hamburger}
          onClick={() => setMobileHam(!mobileHam)}
        >
          <Icon
            className={`bi bi-list ${theme === "dark" ? styles.icon_dark : styles.icon_light
              }`}
            size={"1.5rem"}
          />
        </div>

        <div className={styles.header__left}>
          <div className={styles.header__logo} onClick={() => router.push("/")}>
            {theme === "dark" ? (
              <NextImage src={Logo_Dark} alt="Logo_Dark" />
            ) : (
              <NextImage src={Logo_Light} alt="Logo_Dark" />
            )}
          </div>
          {HeaderData.map((item, i) => (
            <div
              key={item.id}
              className={`${styles.header__left__element} ${theme === "dark" ? styles.dark : styles.light
                } ${isActive(item.route) ? styles.active : ""}`}
            >
              <Link
                href={item?.id === 5 ? "" : item.route}
                onClick={() => item?.id === 5 && showModal()}
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <Modal
          className={"modal__wrap"}
          title="Bridge"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <iframe
            src="https://dev-transit.comdex.one/"
            frameBorder="0"
            width={"100%"}
            height={"580px"}
            style={{ borderRadius: "10px", background: "#030b1e" }}
          ></iframe>
        </Modal>

        <div className={styles.dropdown}>
          <div className={styles.header__right}>
            <div className={styles.header__cSwap}>
              <div className={styles.header__cSwap__main}>
                {theme === "dark" ? (
                  <NextImage src={C_Logo} alt="Logo_Dark" />
                ) : (
                  <NextImage src={C_Logo} alt="Logo_Dark" />
                )}

                <div
                  className={`${styles.header__cSwap__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"cSwap"}
                </div>
              </div>
              <Icon
                className={`bi bi-grid-fill ${theme === "dark" ? styles.icon_dark : styles.icon_light
                  }`}
              />
            </div>

            <div className={styles.header__faucet}>
              <NextImage src={Faucet} alt="Logo_Dark" />
              <div
                className={`${styles.header__faucet__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"Faucet"}
              </div>
            </div>

            {address ? (
              <div className="connected_div" id="topRightToogle">
                {/* <div className="connected_left">
                  <div className="testnet-top"></div>
                </div> */}
                <DisconnectModal />
              </div>
            ) : (
              <>
                <Dropdown
                  menu={{ items }}
                  placement="bottomRight"
                  trigger={["click"]}
                  overlayClassName="dropconnect-overlay"
                  getPopupContainer={() =>
                    document.getElementById("topRightToogle")
                  }
                >
                  <div className={styles.header__wallet}>
                    {/* {variables[lang]?.connect} */}
                    Connect wallet
                  </div>
                </Dropdown>
              </>
            )}

            <Icon
              className={`bi bi-three-dots-vertical ${theme === "dark" ? styles.icon_dark : styles.icon_light
                }`}
              size={"2rem"}
            />

            {/* {isOpen.cSwap && (
              <div className={styles.dropdown__cSwap__menu} ref={cSwapRef}>
                {cSwapDropdownData.map((item) => (
                  <button key={item.id}>{item.name}</button>
                ))}
              </div>
            )} */}

            {/* {isOpen.wallet && (
              <div className={styles.dropdown__wallet__menu} ref={walletRef}>
                <div className={styles.dropdown__wallet__title}>
                  {' Connect Wallet'}
                </div>
                <button>{'Keplr Wallet'}</button>
              </div>
            )} */}

            {/* {isOpen.dot && (
              <div className={styles.dropdown__dot__menu} ref={dotRef}>
                {DotDropdownData.map((item) => (
                  <div key={item.id} className={styles.dropdown__dot__item}>
                    <Link href="#">
                      <div>
                        <Icon
                          className={`${item.icon} ${
                            theme === "dark"
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
            )} */}

            <Sidebar isOpen={mobileHam} setIsOpen={setMobileHam} />
          </div>
        </div>
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
  setEnvConfig,
};

export default connect(stateToProps, actionsToProps)(Header);
