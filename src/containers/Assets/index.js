import { Button, message, Table } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { IoReload } from "react-icons/io5";
import { connect, useDispatch } from "react-redux";
import { setAccountBalances } from "../../actions/account";
import { setMarkets } from "../../actions/oracle";
import { Col, Row, SvgIcon } from "../../components/common";
import AssetList from "../../config/ibc_assets.json";
import { cmst, comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
import { fetchRestPrices } from "../../services/oracle/query";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion
} from "../../utils/coin";
import { commaSeparator, marketPrice } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import variables from "../../utils/variables";
import Deposit from "./Deposit";
import "./index.scss";
import Withdraw from "./Withdraw";

const Assets = ({
  lang,
  assetBalance,
  balances,
  markets,
  parent,
  refreshBalance
}) => {

  const [pricesInProgress, setPricesInProgress] = useState(false);

  const dispatch = useDispatch();

  const handleBalanceRefresh = () => {
    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });

    updatePrices()
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
            {price?.denom === cmst?.coinMinimalDenom ? "$" : ""}
            {commaSeparator(
              Number(price?.value || 0).toFixed(DOLLAR_DECIMALS)
            )}{" "}
            {price?.denom !== cmst?.coinMinimalDenom
              ? denomConversion(cmst?.coinMinimalDenom)
              : ""}
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
            {amount?.denom === cmst?.coinMinimalDenom ? "$" : ""}
            {commaSeparator(
              amountConversion(amount?.value || 0, DOLLAR_DECIMALS)
            )}{" "}
            {amount?.denom !== cmst?.coinMinimalDenom
              ? denomConversion(cmst?.coinMinimalDenom)
              : ""}{" "}
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
            <Deposit chain={value} />
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
            <Withdraw chain={value} />
          );
        }
      },
    },
  ];

  const getPrice = (denom) => {
    return marketPrice(markets, denom) || 0;
  };

  let assetsWithoutExternalLinks = AssetList?.tokens?.filter(
    (item) => !item.hasOwnProperty("depositUrlOverride")
  );

  let ibcBalances = assetsWithoutExternalLinks?.map((token) => {
    const ibcBalance = balances.find(
      (item) => item.denom === token?.ibcDenomHash
    );

    const value = getPrice(ibcBalance?.denom) * ibcBalance?.amount;

    return {
      chainInfo: getChainConfig(token),
      coinMinimalDenom: token?.coinMinimalDenom,
      balance: {
        amount: ibcBalance?.amount ? amountConversion(ibcBalance.amount) : 0,
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

  const currentChainData = [
    {
      key: comdex.chainId,
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
        value: nativeCoinValue || 0,
        denom: comdex?.coinMinimalDenom,
      },
    },
    {
      key: cmst.coinMinimalDenom,
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
        value: cmstCoinValue || 0,
        denom: cmst?.coinMinimalDenom,
      },
    },
    {
      key: harbor.coinMinimalDenom,
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
        value: harborCoinValue || 0,
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
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon name={iconNameFromDenom(item?.coinMinimalDenom)} />
              </div>{" "}
              {denomConversion(item?.coinMinimalDenom)}{" "}
            </div>
          </>
        ),
        noOfTokens: item?.balance?.amount,
        price: {
          value: getPrice(item?.ibcDenomHash),
          denom: item?.ibcDenomHash,
        },
        amount: item.balance,
        ibcdeposit: item,
        ibcwithdraw: item,
      };
    });

  const tableData = Lodash.concat(currentChainData, tableIBCData);

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
                  {amountConversionWithComma(assetBalance, DOLLAR_DECIMALS)}{" "}
                  {variables[lang].CMST}
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
          <Col>
            <Table
              className="custom-table assets-table"
              dataSource={tableData}
              columns={columns}
              loading={pricesInProgress}
              pagination={false}
              scroll={{ x: "100%" }}
            />
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
  assetBalance: PropTypes.number,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    refreshBalance: state.account.refreshBalance,  };
};

const actionsToProps = {
  setAccountBalances,
  setMarkets,
};

export default connect(stateToProps, actionsToProps)(Assets);
