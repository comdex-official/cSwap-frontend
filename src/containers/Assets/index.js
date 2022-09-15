import { Button, Table } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Col, Row, SvgIcon } from "../../components/common";
import AssetList from "../../config/ibc_assets.json";
import { comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
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
  poolPriceMap,
}) => {
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
      width: 100,
      render: (price) => (
        <>
          <p className="text-left">
            ${commaSeparator(Number(price || 0).toFixed(DOLLAR_DECIMALS))}
          </p>
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
    return poolPriceMap[denom] || marketPrice(markets, denom) || 0;
  };

  let ibcBalances = AssetList?.tokens.map((token) => {
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
      price: getPrice(comdex?.coinMinimalDenom),
      amount: {
        value: nativeCoinValue || 0,
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
      price: getPrice(harbor?.coinMinimalDenom),
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
        price: getPrice(item?.coinMinimalDenom),
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
  poolPriceMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

export default connect(stateToProps)(Assets);
