import { Button, Input, message, Switch, Table, Tabs } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { IoReload } from "react-icons/io5";
import { connect, useDispatch } from "react-redux";
import { setAccountBalances } from "../../actions/account";
import { setLPPrices, setMarkets } from "../../actions/oracle";
import { Col, Row, SvgIcon } from "../../components/common";
import NoDataIcon from "../../components/common/NoDataIcon";
import AssetList from "../../config/ibc_assets.json";
import { cmst, comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
import { fetchRestPrices } from "../../services/oracle/query";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
} from "../../utils/coin";
import {
  commaSeparator,
  formateNumberDecimalsAuto,
  marketPrice,
} from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import variables from "../../utils/variables";
import Deposit from "./Deposit";
import "./index.scss";
import LPAsssets from "./LPAassets";
import Withdraw from "./Withdraw";

const Assets = ({
  lang,
  assetBalance,
  balances,
  markets,
  parent,
  refreshBalance,
  assetMap,
  assetDenomMap,
  setMarkets,
  setLPPrices,
  lpPrices,
}) => {
  const [pricesInProgress, setPricesInProgress] = useState(false);
  const [isHideToggleOn, setHideToggle] = useState(false);
  const [searchKey, setSearchKey] = useState();
  const [filterValue, setFilterValue] = useState("1");
  const [isLedgerAccount, setIsLedgerAccount] = useState(false);
  const [walletType, setWalletType] = useState("")

  const dispatch = useDispatch();

  const tabItems = [
    {
      key: "1",
      label: "Assets",
    },
    {
      key: "2",
      label: "LF Tokens",
    },
  ];

  window.addEventListener("keplr_keystorechange", () => {
    checkAccountType();
  });

  useEffect(() => {
    let wallet = localStorage.getItem("loginType")
    setWalletType(wallet)

  })

  const checkAccountType = async () => {
    const chainId = comdex?.chainId;

    const walletWindowName = walletType;
    const key = window[walletWindowName]?.getKey;

    if (walletType === "keplr") {
      if (key) {
        const account = await key(chainId);
        setIsLedgerAccount(account?.isNanoLedger || false);
      } else {
        setIsLedgerAccount(false);
      }
    }
    else {
      if (walletType === "ledger") {
        setIsLedgerAccount(true);
      }
    }
  };

  useEffect(() => {
    checkAccountType();
  }, [walletType]);


  const handleBalanceRefresh = () => {
    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });

    updatePrices();
  };

  useEffect(() => {
    setHideToggle(localStorage.getItem("hideToggle") === "true");
  }, []);

  const handleHideSwitchChange = (value) => {
    localStorage.setItem("hideToggle", value);
    setHideToggle(value);
  };

  const onSearchChange = (searchKey) => {
    setSearchKey(searchKey.trim().toLowerCase());
  };

  const updatePrices = () => {
    setPricesInProgress(true);

    fetchRestPrices((error, result) => {
      setPricesInProgress(false);

      if (error) {
        message.error(error);
        return;
      }

      setMarkets(result.data);
    });
  };

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
    },
    {
      title: "No. of Tokens",
      dataIndex: "noOfTokens",
      key: "noOfTokens",
      align: "left",
      render: (tokens) => (
        <>
          <p>{commaSeparator(Number(tokens || 0))}</p>
        </>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "left",
      width: 150,
      render: (price) => (
        <>
          <p className="text-left">
            ${formateNumberDecimalsAuto({ price: Number(price?.value) || 0 })}
          </p>
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "left",
      render: (amount) => (
        <>
          <p>
            $
            {commaSeparator(
              Number(amount?.value || 0).toFixed(DOLLAR_DECIMALS)
            )}
          </p>
        </>
      ),
    },
    {
      title: "IBC Deposit",
      dataIndex: "ibcdeposit",
      key: "ibcdeposit",
      align: "left",
      // width: 210,
      render: (value) => {
        if (value) {
          return value?.depositUrlOverride ? (
            <Button type="primary" size="small">
              <a
                href={value?.depositUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Deposit{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <SvgIcon name="hyperlink" />
                </span>
              </a>
            </Button>
          ) : (
            <Deposit
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
              disable={isLedgerAccount === true && value?.chainInfo?.chainName === "stride" ? true : false}
            />
          );
        }
      },
    },
    {
      title: "IBC Withdraw",
      dataIndex: "ibcwithdraw",
      key: "ibcwithdraw",
      width: 110,
      render: (value) => {
        if (value) {
          return value?.withdrawUrlOverride ? (
            <Button type="primary" size="small">
              <a
                href={value?.withdrawUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Withdraw{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <SvgIcon name="hyperlink" />
                </span>
              </a>
            </Button>
          ) : (
            <Withdraw
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
            />
          );
        }
      },
    },
  ];

  const getPrice = (denom) => {
    return marketPrice(markets, denom) || 0;
  };

  let appAssets = AssetList?.tokens?.filter(
    (item) => item?.ibcDenomHash === assetDenomMap?.[item?.ibcDenomHash]?.denom
  );

  let ibcBalances = appAssets?.map((token) => {
    const ibcBalance = balances.find(
      (item) => item.denom === token?.ibcDenomHash
    );

    const value =
      getPrice(ibcBalance?.denom) *
      amountConversion(
        ibcBalance?.amount,
        assetMap[ibcBalance?.denom]?.decimals
      );
    return {
      chainInfo: getChainConfig(token),
      coinMinimalDenom: token?.coinMinimalDenom,
      symbol: token?.symbol,
      balance: {
        amount: ibcBalance?.amount
          ? amountConversion(
              ibcBalance.amount,
              assetMap[ibcBalance?.denom]?.decimals
            )
          : 0,
        value: value || 0,
        denom: ibcBalance?.denom,
      },

      sourceChannelId: token.comdexChannel,
      destChannelId: token.channel,
      ibcDenomHash: token?.ibcDenomHash,
      explorerUrlToTx: token?.explorerUrlToTx,
      depositUrlOverride: token?.depositUrlOverride,
      withdrawUrlOverride: token?.withdrawUrlOverride,
    };
  });

  const nativeCoin = balances.filter(
    (item) => item.denom === comdex?.coinMinimalDenom
  )[0];
  const nativeCoinValue = getPrice(nativeCoin?.denom) * nativeCoin?.amount;

  const cmstCoin = balances.filter(
    (item) => item.denom === cmst?.coinMinimalDenom
  )[0];

  const cmstCoinValue = getPrice(cmstCoin?.denom) * cmstCoin?.amount;

  const harborCoin = balances.filter(
    (item) => item.denom === harbor?.coinMinimalDenom
  )[0];
  const harborCoinValue = getPrice(harborCoin?.denom) * harborCoin?.amount;

  let currentChainData = [
    {
      key: comdex.chainId,
      symbol: comdex?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(comdex?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(comdex?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: nativeCoin?.amount ? amountConversion(nativeCoin.amount) : 0,
      price: {
        value: getPrice(comdex?.coinMinimalDenom),
        denom: comdex?.coinMinimalDenom,
      },

      amount: {
        value: amountConversion(nativeCoinValue || 0),
        denom: comdex?.coinMinimalDenom,
      },
    },
    {
      key: cmst.coinMinimalDenom,
      symbol: cmst?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(cmst?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(cmst?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: cmstCoin?.amount ? amountConversion(cmstCoin.amount) : 0,
      price: {
        value: getPrice(cmst?.coinMinimalDenom),
        denom: cmst?.coinMinimalDenom,
      },

      amount: {
        value: amountConversion(cmstCoinValue || 0),
        denom: cmst?.coinMinimalDenom,
      },
    },
    {
      key: harbor.coinMinimalDenom,
      symbol: harbor?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(harbor?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(harbor?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: harborCoin?.amount ? amountConversion(harborCoin.amount) : 0,
      price: {
        value: getPrice(harbor?.coinMinimalDenom),
        denom: harbor?.coinMinimalDenom,
      },

      amount: {
        value: amountConversion(harborCoinValue || 0),
        denom: harbor?.coinMinimalDenom,
      },
    },
  ];

  ibcBalances =
    parent && parent === "portfolio"
      ? ibcBalances.filter((item) => item?.balance?.amount > 0)
      : ibcBalances;

  const tableIBCData =
    ibcBalances &&
    ibcBalances.map((item) => {
      return {
        key: item?.coinMinimalDenom,
        symbol: item?.symbol,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon name={iconNameFromDenom(item?.ibcDenomHash)} />
              </div>{" "}
              {denomConversion(item?.ibcDenomHash)}{" "}
            </div>
          </>
        ),
        noOfTokens: Number(item?.balance?.amount || 0)?.toFixed(
          comdex?.coinDecimals
        ),
        price: {
          value: getPrice(item?.ibcDenomHash),
          denom: item?.ibcDenomHash,
        },
        amount: item.balance,
        ibcdeposit: item,
        ibcwithdraw: item,
      };
    });

  let allTableData = Lodash.concat(currentChainData, tableIBCData);

  let tableData =
    isHideToggleOn && filterValue === "1"
      ? allTableData?.filter((item) => Number(item?.noOfTokens) > 0)
      : allTableData;

  tableData =
    searchKey && filterValue === "1"
      ? tableData?.filter((item) => {
          return item?.symbol?.toLowerCase().includes(searchKey?.toLowerCase());
        })
      : tableData;

  let balanceExists = allTableData?.find(
    (item) => Number(item?.noOfTokens) > 0
  );

  const onChange = (key) => {
    setFilterValue(key);
  };

  return (
    <div className="app-content-wrapper">
      <div className="assets-section">
        {parent && parent === "portfolio" ? null : (
          <Row>
            <Col>
              <div className="assets-head">
                <div>
                  <h2>{variables[lang].comdex_assets}</h2>
                </div>
                <div>
                  <span>{variables[lang].total_asset_balance}</span>{" "}
                  {commaSeparatorWithRounding(assetBalance, DOLLAR_DECIMALS)}{" "}
                  {variables[lang].USD}
                  <span
                    className="asset-reload-btn"
                    onClick={() => handleBalanceRefresh()}
                  >
                    {" "}
                    <IoReload />{" "}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        )}
        <Row>
          {/* <div className="mt-4">
            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              activeKey={filterValue}
              onChange={onChange}
              className="comdex-tabs farm-details-tabmain"
            />
          </div> */}
          <Col className="assets-search-section">
            {parent && parent === "portfolio" ? null : (
              <div className="text">
                Hide 0 Balances{" "}
                <Switch
                  disabled={!balanceExists}
                  onChange={(value) => handleHideSwitchChange(value)}
                  checked={isHideToggleOn}
                />
              </div>
            )}
            <Input
              placeholder="Search Asset.."
              onChange={(event) => onSearchChange(event.target.value)}
              suffix={<SvgIcon name="search" viewbox="0 0 18 18" />}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            {/* {filterValue === "1" ? ( */}
              <Table
                className="custom-table assets-table"
                dataSource={tableData}
                columns={columns}
                loading={pricesInProgress}
                pagination={false}
                scroll={{ x: "100%" }}
                locale={{ emptyText: <NoDataIcon /> }}
              />
            {/* ) : (
              <LPAsssets
                isHideToggleOn={isHideToggleOn}
                searchKey={searchKey}
                activeKey={filterValue}
              />
            )} */}
          </Col>
        </Row>
      </div>
    </div>
  );
};

Assets.propTypes = {
  lang: PropTypes.string.isRequired,
  setAccountBalances: PropTypes.func.isRequired,
  setMarkets: PropTypes.func.isRequired,
  setLPPrices: PropTypes.func.isRequired,
  assetBalance: PropTypes.number,
  assetMap: PropTypes.object,
  assetDenomMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  lpPrices: PropTypes.object,
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    lpPrices: state.oracle.lpPrice.list,
    refreshBalance: state.account.refreshBalance,
    assetMap: state.asset.map,
    assetDenomMap: state.asset.appAssetMap,
  };
};

const actionsToProps = {
  setAccountBalances,
  setMarkets,
  setLPPrices,
};

export default connect(stateToProps, actionsToProps)(Assets);
