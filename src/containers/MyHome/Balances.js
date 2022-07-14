import "./index.scss";
import { Col, Row } from "../../components/common";
import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import TooltipIcon from "../../components/TooltipIcon";
import { amountConversionWithComma, amountConversion } from "../../utils/coin";
import variables from "../../utils/variables";
import { useLocation } from "react-router";
import { decode } from "../../utils/string";
import { commaSeparator, formatNumber } from "../../utils/number";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
  DOLLAR_DECIMALS,
} from "../../constants/common";
import { getDenomBalance } from "../../utils/coin";
import { marketPrice } from "../../utils/number";
import {
  queryPoolCoinDeserialize,
  queryPoolsList,
  queryPoolSoftLocks,
} from "../../services/liquidity/query";
import { message } from "antd";
import History from "./History";
import MyPools from "./MyPools";
import Assets from "../Assets";

const { TabPane } = Tabs;

const Balances = ({
  lang,
  assetBalance,
  isDarkMode,
  address,
  setPools,
  balances,
  markets,
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

  useEffect(() => {
    setUserLiquidityInPools();
    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  }, [markets, balances]);

  const fetchPools = (offset, limit, countTotal, reverse) => {
    queryPoolsList(offset, limit, countTotal, reverse, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setPools(result.pools, result.pagination);

      const userPools = result?.pools?.filter((pool) => {
        return balances.find((balance) => {
          return balance.denom === pool.poolCoinDenom;
        });
      });

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
  };

  const getTotalValue = () => {
    const total =
      Number(amountConversion(assetBalance)) + Number(totalFarmBalance);
    return commaSeparator((total || 0).toFixed(DOLLAR_DECIMALS));
  };

  const getUserLiquidity = (pool) => {
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
        queryPoolCoinDeserialize(pool?.id, totalPoolToken, (error, result) => {
          if (error) {
            message.error(error);
            return;
          }

          const providedTokens = result?.coins;
          const totalLiquidityInDollar =
            Number(amountConversion(providedTokens?.[0]?.amount)) *
              marketPrice(markets, providedTokens?.[0]?.denom) +
            Number(amountConversion(providedTokens?.[1]?.amount)) *
              marketPrice(markets, providedTokens?.[1]?.denom);

          if (totalLiquidityInDollar) {
            setUserLiquidityInPools(pool?.id, totalLiquidityInDollar);
          }
        });
      });
    }
  };

  const totalFarmBalance = Object.values(userLiquidityInPools)?.reduce(
    (a, b) => a + b,
    0
  );

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
            y: Number(amountConversion(assetBalance)) || 0,
            color: isDarkMode ? "#123C73" : "#78c1ff",
          },
        ],
      },
    ],
  };

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
                        {amountConversionWithComma(
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
                >
                  <TabPane tab="Assets" key="1">
                    <Assets parent="portfolio" />
                  </TabPane>
                  <TabPane tab="Farm" key="2">
                    <MyPools />
                  </TabPane>
                  <TabPane tab="History" key="3">
                    <History />
                  </TabPane>
                </Tabs>
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

export default Balances;
