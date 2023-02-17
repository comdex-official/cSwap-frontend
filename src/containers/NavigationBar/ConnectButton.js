import { Button, Dropdown, message } from "antd";
import { decode, encode } from "js-base64";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  setAccountAddress,
  setAccountBalances,
  setAccountName,
  setAssetBalance,
  showAccountConnectModal
} from "../../actions/account";
import {
  setAppAssets,
  setAssets,
  setAssetsInPrgoress
} from "../../actions/asset";
import { setPoolIncentives, setPoolRewards } from "../../actions/liquidity";
import { setMarkets } from "../../actions/oracle";
import { setParams } from "../../actions/swap";
import { SvgIcon } from "../../components/common";
import { cmst, comdex, harbor } from "../../config/network";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  NETWORK_TAG
} from "../../constants/common";
import { queryAssets } from "../../services/asset/query";
import { queryAllBalances } from "../../services/bank/query";
import { fetchKeplrAccountName, initializeChain } from "../../services/keplr";
import {
  fetchAllTokens,
  fetchRestAPRs,
  queryLiquidityParams,
  queryPoolIncentives
} from "../../services/liquidity/query";
import { fetchRestPrices } from "../../services/oracle/query";
import { amountConversion } from "../../utils/coin";
import { marketPrice } from "../../utils/number";
import variables from "../../utils/variables";
import DisConnectModal from "../DisConnectModal";
import ConnectModal from "../Modal";

const ConnectButton = ({
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
}) => {
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

  useEffect(() => {
    if (address) {
      let ws = new WebSocket(`${comdex?.webSocketApiUrl}`);

      ws.onopen = () => {
        ws.send(JSON.stringify(subscription));
        ws.send(JSON.stringify(subscription2));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response?.result?.events) {
          const savedAddress = localStorage.getItem("ac");
          const userAddress = savedAddress ? decode(savedAddress) : address;
          fetchBalances(userAddress);
        }
      };

      ws.onclose = () => {
        console.log("Connection Closed! 0");
      };

      ws.onerror = (error) => {
        console.log(error, "WS Error");
      };
    }
  }, [address]);

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

  const items = [{ label: <ConnectModal />, key: "item-1" }];

  return (
    <>
      {address ? (
        <div className="connected_div" id="topRightToogle">
          <div className="connected_left">
            <div className="testnet-top">
              <SvgIcon name="testnet" /> {NETWORK_TAG || "Testnet"}
            </div>
          </div>
          <DisConnectModal />
        </div>
      ) : (
        <div id="topRightToogle">
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="dropconnect-overlay"
            getPopupContainer={() => document.getElementById('topRightToogle')}
          >
            <Button shape="round" type="primary">
              {variables[lang].connect}
            </Button>
          </Dropdown>
        </div>
      )}
    </>
  );
};

ConnectButton.propTypes = {
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
};

export default connect(stateToProps, actionsToProps)(ConnectButton);
