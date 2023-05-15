import { Button, Col, Input, message, Row, Switch, Table } from "antd"
import Lodash from "lodash"
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react"
// import NoDataIcon from "../../components/common/NoDataIcon";
import { setLPPrices, setMarkets } from "../../actions/oracle";
import { cmst, comdex, harbor } from '../../config/network';
import { DOLLAR_DECIMALS } from "../../constants/common"
import { getChainConfig } from "../../services/keplr"
import { fetchRestPrices } from "../../services/oracle/query"
import { amountConversion, denomConversion } from "../../utils/coin"
import { connect, useDispatch } from "react-redux";
import { setAccountBalances } from "../../actions/account";
import {
  commaSeparator,
  formateNumberDecimalsAuto,
  marketPrice
} from "../../utils/number"
import Deposit from "./Deposit"
import "./Portfolio.module.scss"
import Withdraw from "./Withdraw"
import { Icon } from "../../shared/image/Icon";
import styles from './Portfolio.module.scss';
import { NextImage } from "../../shared/image/NextImage";

const PortofolioTable = ({
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
  iconList,
  AssetList,
}) => {

  const [pricesInProgress, setPricesInProgress] = useState(false);
  const [isHideToggleOn, setHideToggle] = useState(false);
  const [searchKey, setSearchKey] = useState();
  const [filterValue, setFilterValue] = useState("1");


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
                  {/* <SvgIcon name="hyperlink" /> */}
                </span>
              </a>
            </Button>
          ) : (
            <Deposit
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
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
                  {/* <SvgIcon name="hyperlink" /> */}
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
              {/* <SvgIcon name={iconNameFromDenom(comdex?.coinMinimalDenom)} /> */}
              <NextImage src={iconList?.[comdex?.coinMinimalDenom]?.coinImageUrl} width={30} height={30} alt="" />
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
              {/* <SvgIcon name={iconNameFromDenom(cmst?.coinMinimalDenom)} /> */}
              <NextImage src={iconList?.[cmst?.coinMinimalDenom]?.coinImageUrl} width={30} height={30} alt="" />

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
              {/* <SvgIcon name={iconNameFromDenom(harbor?.coinMinimalDenom)} /> */}
              <NextImage src={iconList?.[harbor?.coinMinimalDenom]?.coinImageUrl} width={30} height={30} alt="" />
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
                {/* <SvgIcon name={iconNameFromDenom(item?.ibcDenomHash)} /> */}
                <NextImage src={iconList?.[item?.ibcDenomHash]?.coinImageUrl} width={30} height={30} alt="" />
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
        <Row className={styles.portifolio_toggle_main_row} >
          <Col
            className="assets-search-section"
            style={{ alignItems: "center", display: "flex", gap: "10px" }}
          >
            {/* {parent && parent === "portfolio" ? null : ( */}
            <div
              className="text"
              style={{
                display: "flex",
                width: "110%",
                gap: "3px",
                color: "white"
              }}
            >
              Hide 0 Balances{" "}
              <Switch
                disabled={!balanceExists}
                onChange={value => handleHideSwitchChange(value)}
                checked={isHideToggleOn}
              />
            </div>
            {/* )} */}
            <Input
              placeholder="Search Asset.."
              onChange={event => onSearchChange(event.target.value)}
              // suffix={<SvgIcon name="search" viewbox="0 0 18 18" />}
              // suffix={<Icon className={"bi bi-search"} />}
              className="asset_search_input"
            />
          </Col>
        </Row>
        <Row style={{ width: "100%" }}>
          <Col style={{ width: "100%" }}>
            {/* {filterValue === "1" ? ( */}
            <Table
              className="custom-table assets-table"
              dataSource={tableData}
              columns={columns}
              loading={pricesInProgress}
              pagination={false}
              // locale={{ emptyText: <NoDataIcon /> }}
              scroll={{ x: "100%" }}
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
  )
}

PortofolioTable.propTypes = {
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
    iconList: state.config?.iconList,
    AssetList: state.config.AssetList,
  };
};

const actionsToProps = {
  setAccountBalances,
  setMarkets,
  setLPPrices,
};

export default connect(stateToProps, actionsToProps)(PortofolioTable);

