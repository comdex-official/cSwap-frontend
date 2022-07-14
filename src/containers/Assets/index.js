import "./index.scss";
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../components/common";
import { connect } from "react-redux";
import React from "react";
import { Table } from "antd";
import variables from "../../utils/variables";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
} from "../../utils/coin";
import { ibcAssetsInfo } from "../../config/ibc";
import { embedChainInfo } from "../../config/chain";
import { message } from "antd";
import { iconNameFromDenom } from "../../utils/string";
import { cmst, harbor, comdex } from "../../config/network";
import Lodash from "lodash";
import { commaSeparator, marketPrice } from "../../utils/number";
import { DOLLAR_DECIMALS } from "../../constants/common";

const Assets = ({ lang, assetBalance, balances, markets, parent }) => {
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
      title: "Oracle Price",
      dataIndex: "oraclePrice",
      key: "oraclePrice",
      align: "left",
      width: 100,
      render: (price) => (
        <>
          <p>${commaSeparator(Number(price || 0).toFixed(DOLLAR_DECIMALS))}</p>
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "left",
      render: (balance) => (
        <>
          <p>
            $
            {commaSeparator(
              amountConversion(balance?.value || 0, DOLLAR_DECIMALS)
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
          return <Deposit chain={value} />;
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
          return <Withdraw chain={value} />;
        }
      },
    },
  ];

  const getPrice = (denom) => {
    return marketPrice(markets, denom) || 0;
  };

  let ibcBalances = ibcAssetsInfo.map((channelInfo) => {
    const chainInfo = embedChainInfo.filter(
      (item) => item.chainId === channelInfo.counterpartyChainId
    )[0];

    const originCurrency =
      chainInfo &&
      chainInfo.currencies.find(
        (cur) => cur.coinMinimalDenom === channelInfo.coinMinimalDenom
      );

    if (!originCurrency) {
      message.info(
        `Unknown currency ${channelInfo.coinMinimalDenom} for ${channelInfo.counterpartyChainId}`
      );
    }

    const ibcBalance = balances.find(
      (item) => item.denom === channelInfo?.ibcDenomHash
    );
    const value = getPrice(ibcBalance?.denom) * ibcBalance?.amount;

    return {
      chainInfo: chainInfo,
      denom: originCurrency?.coinMinimalDenom,
      balance: {
        amount: ibcBalance?.amount ? amountConversion(ibcBalance.amount) : 0,
        value: value || 0,
      },
      ibc: ibcBalance,
      sourceChannelId: channelInfo.sourceChannelId,
      destChannelId: channelInfo.destChannelId,
      isUnstable: channelInfo.isUnstable,
      currency: originCurrency,
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
      oraclePrice: getPrice(comdex?.coinMinimalDenom),
      amount: {
        value: nativeCoinValue || 0,
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
      oraclePrice: getPrice(cmst?.coinMinimalDenom),
      amount: {
        value: cmstCoinValue || 0,
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
      oraclePrice: getPrice(harbor?.coinMinimalDenom),
      amount: {
        value: harborCoinValue || 0,
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
        key: item.denom,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(item.currency?.coinMinimalDenom)}
                />
              </div>{" "}
              {item.currency?.coinDenom}{" "}
            </div>
          </>
        ),
        noOfTokens: item?.balance?.amount,
        oraclePrice: getPrice(item.currency?.coinMinimalDenom),
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
                  {variables[lang].USD}
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
  assetBalance: PropTypes.number,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      symbol: PropTypes.string,
      script_id: PropTypes.string,
    })
  ),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
  };
};

export default connect(stateToProps)(Assets);
