import { message, Tabs } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import { Col, Row } from "../../components/common";
import TooltipIcon from "../../components/TooltipIcon";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DOLLAR_DECIMALS
} from "../../constants/common";
import {
  queryPoolCoinDeserialize,
  queryPoolsList,
  queryPoolSoftLocks
} from "../../services/liquidity/query";
import {
  amountConversion,
  commaSeparatorWithRounding,
  getDenomBalance
} from "../../utils/coin";
import { commaSeparator, formatNumber, marketPrice } from "../../utils/number";
import { decode } from "../../utils/string";
import variables from "../../utils/variables";
import Assets from "../Assets";
import History from "./History";
import "./index.scss";
import MyPools from "./MyPools";

const Balances = ({
  lang,
  assetBalance,
  isDarkMode,
  address,
  setPools,
  balances,
  markets,
  assetMap,
  setUserLiquidityInPools,
  userLiquidityInPools,
}) => {
  const [activeKey, setActiveKey] = useState("1");

  const location = useLocation();
  const tab = decode(location.hash);

  useEffect(() => {
    if (tab) {
      setActiveKey(tab);
    }
  }, [tab]);

  const getUserLiquidity = useCallback(
    (pool) => {
      if (address) {
        queryPoolSoftLocks(address, pool?.id, (error, result) => {
          if (error) {
            return;
          }

          const availablePoolToken =
            getDenomBalance(balances, pool?.poolCoinDenom) || 0;

          const activeSoftLock = result?.activePoolCoin;
          const queuedSoftLocks = result?.queuedPoolCoin;

          const queuedAmounts =
            queuedSoftLocks &&
            queuedSoftLocks.length > 0 &&
            queuedSoftLocks?.map((item) => item?.poolCoin?.amount);
          const userLockedAmount =
            Number(
              queuedAmounts?.length > 0 &&
                queuedAmounts?.reduce((a, b) => Number(a) + Number(b), 0)
            ) + Number(activeSoftLock?.amount) || 0;

          const totalPoolToken = Number(availablePoolToken) + userLockedAmount;
          queryPoolCoinDeserialize(
            pool?.id,
            totalPoolToken,
            (error, result) => {
              if (error) {
                message.error(error);
                return;
              }

              const providedTokens = result?.coins;
              const totalLiquidityInDollar =
                Number(
                  amountConversion(
                    providedTokens?.[0]?.amount,
                    assetMap[providedTokens?.[0]?.denom]?.decimals
                  )
                ) *
                  marketPrice(markets, providedTokens?.[0]?.denom) +
                Number(
                  amountConversion(
                    providedTokens?.[1]?.amount,
                    assetMap[providedTokens?.[1]?.denom]?.decimals
                  )
                ) *
                  marketPrice(markets, providedTokens?.[1]?.denom);

              setUserLiquidityInPools(pool?.id, totalLiquidityInDollar || 0);
            }
          );
        });
      }
    },
    [assetMap, address, markets, balances]
  );

  const fetchPools = useCallback(
    (offset, limit, countTotal, reverse) => {
      queryPoolsList(offset, limit, countTotal, reverse, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setPools(result.pools, result.pagination);

        const userPools = result?.pools;

        if (
          balances &&
          balances.length > 0 &&
          userPools &&
          userPools.length > 0
        ) {
          userPools.forEach((item) => {
            return getUserLiquidity(item);
          });
        }
      });
    },
    [balances, getUserLiquidity, setPools]
  );

  useEffect(() => {
    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  }, [markets, balances, fetchPools]);

  const totalFarmBalance = Object.values(userLiquidityInPools)?.reduce(
    (a, b) => a + b,
    0
  );

  const getTotalValue = useCallback(() => {
    const total = Number(assetBalance) + Number(totalFarmBalance);
    return commaSeparator((total || 0).toFixed(DOLLAR_DECIMALS));
  }, [assetBalance, totalFarmBalance]);

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 160,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    subtitle: {
      text: `${getTotalValue()} <br /> ${variables[lang].USD}`,
      floating: !!address,
      style: {
        fontSize: "20px",
        fontWeight: "300",
        fontFamily: "Lexend Deca",
        color: isDarkMode ? "#fff" : "#000",
      },
      y: 70,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "130%",
        innerSize: "80%",
        borderWidth: 0,
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    tooltip: {
      formatter: function () {
        return (
          '<div style="text-align:center; font-weight:800; ">' +
          formatNumber(this.y.toFixed(DOLLAR_DECIMALS)) +
          "<br />" +
          '<small style="font-size: 10px; font-weight:400;">' +
          this.key +
          "</small>" +
          "</div>"
        );
      },
      useHTML: true,
      backgroundColor: "#222A49",
      borderColor: "#222A49",
      borderRadius: 10,
      zIndex: 99,
      style: {
        color: "#fff",
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: variables[lang].farm_balance,
            y: Number(totalFarmBalance) || 0,
            color: isDarkMode ? "#1A4F94" : "#5099f4",
          },
          {
            name: variables[lang].asset_balance,
            y: Number(assetBalance) || 0,
            color: isDarkMode ? "#123C73" : "#78c1ff",
          },
        ],
      },
    ],
  };

  const tabItems = [
    {
      label: "Assets",
      key: "1",
      children: <Assets parent="portfolio" />,
    },
    {
      label: "Liquidity",
      key: "2",
      children: <MyPools />,
    },
    { label: "History", key: "3", children: <History /> },
  ];

  return (
    <div className="app-content-wrapper">
      {address ? (
        <>
          <Row>
            <Col>
              <div className="MyHome-upper">
                <div className="MyHome-chart">
                  {getTotalValue() <= 0 ? (
                    <div className="nodatachart">
                      {Number(0).toFixed(DOLLAR_DECIMALS)} <p>USD</p>
                    </div>
                  ) : (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={Options}
                    />
                  )}{" "}
                </div>
                <div className="MyHome-upper-right">
                  <Row className="mb-2">
                    <Col>
                      <label>
                        {variables[lang].tv}{" "}
                        <TooltipIcon
                          text={variables[lang].tooltip_total_value}
                        />
                      </label>
                      <h2>
                        {getTotalValue()} {variables[lang].USD}
                      </h2>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs="12" md="12" lg="6">
                      <label className="stats-label">
                        <div className="rect-shape shape-asset-bal" />{" "}
                        {variables[lang].asset_balance}{" "}
                        <TooltipIcon
                          text={variables[lang].tooltip_total_asset}
                        />
                      </label>
                      <h3>
                        {commaSeparatorWithRounding(
                          assetBalance,
                          DOLLAR_DECIMALS
                        )}{" "}
                        {variables[lang].USD}
                      </h3>
                    </Col>
                    <Col xs="12" md="12" lg="6">
                      <label className="stats-label">
                        <div className="rect-shape shape-farm-bal" />{" "}
                        {variables[lang].farm_balance}{" "}
                        <TooltipIcon
                          text={variables[lang].tooltip_total_farm}
                        />
                      </label>
                      <h3>
                        {commaSeparator(
                          Number(totalFarmBalance || 0).toFixed(DOLLAR_DECIMALS)
                        )}{" "}
                        {variables[lang].USD}
                      </h3>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              <div className="myhome-bottom">
                <Tabs
                  className="comdex-tabs"
                  onChange={setActiveKey}
                  activeKey={activeKey}
                  type="card"
                  items={tabItems}
                />
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <div className="loader connect">Please connect wallet</div>
      )}
    </div>
  );
};

Balances.propTypes = {
  assetMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    assetMap: state.asset.map,
  };
};

export default connect(stateToProps)(Balances);
