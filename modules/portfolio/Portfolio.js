import styles from "./Portfolio.module.scss";
import { HighchartsReact } from "highcharts-react-official";
import Highcharts from "highcharts";
import Tab from "../../shared/components/tab/Tab";
import Search from "../../shared/components/search/Search";
import PortfolioTable from "./PortfollioTable";
import { Button, Input, message, Switch, Table, Tabs } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setAccountBalances } from "../../actions/account";
import { setLPPrices, setMarkets } from "../../actions/oracle";
import { cmst, comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
import { fetchRestPrices } from "../../services/oracle/query";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
  getDenomBalance,
} from "../../utils/coin";
import {
  commaSeparator,
  formateNumberDecimalsAuto,
  formatNumber,
  marketPrice,
} from "../../utils/number";
import { Icon } from "../../shared/image/Icon";
import PortifolioTab from "./PortofolioTab";
import {
  queryPoolCoinDeserialize,
  queryPoolsList,
  queryPoolSoftLocks,
} from "../../services/liquidity/query";
import { setPools, setUserLiquidityInPools } from "../../actions/liquidity";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "../../constants/common";
import variables from "../../utils/variables";

const Portfolio = ({
  lang,
  assetBalance,
  balances,
  markets,
  assetMap,
  address,
  setPools,
  setUserLiquidityInPools,
  userLiquidityInPools,
}) => {
  const theme = "dark";

  const [active, setActive] = useState("Assets");

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

  const handleActive = (item) => {
    setActive(item);
  };

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 200,
      width: 200,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: `${formatNumber(getTotalValue() || 0)} <br /> ${
        variables[lang].USD
      }`,
      verticalAlign: "middle",
      floating: true,
      style: {
        fontSize: "25px",
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "Montserrat, sans-serif",
      },
    },
    subtitle: {
      floating: true,
      style: {
        fontSize: "25px",
        fontWeight: "500",
        fontFamily: "Montserrat, sans-serif",
        color: "#fff",
      },
      y: 70,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "100%",
        innerSize: "75%",
        borderWidth: 0,
        className: "highchart_chart",
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
          "$" +
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
            enabled: true,
          },
        },
        name: "",
        data: [
          {
            name: variables[lang].farm_balance,
            y: Number(totalFarmBalance) || 0,
            color: "#1A4F94",
          },
          {
            name: variables[lang].asset_balance,
            y: Number(assetBalance) || 0,
            color: "#123C73",
          },
        ],
      },
    ],
  };

  return (
    <div
      className={`${styles.portfolio__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.portfolio__main} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.portfolio__header__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.portfolio__header__element__wrap} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <HighchartsReact highcharts={Highcharts} options={Options} />
          </div>

          <div
            className={`${styles.portfolio__element__footer__down} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.portfolio__element__upper__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {"Total Value"}
              </div>
              <div
                className={`${styles.portfolio__element__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {getTotalValue()} {variables[lang].USD}
              </div>
            </div>
            <div
              className={`${styles.portfolio__element} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.portfolio__element__upper__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div />
                {"Asset Balance"}
              </div>
              <div
                className={`${styles.portfolio__element__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {commaSeparatorWithRounding(assetBalance, DOLLAR_DECIMALS)}{" "}
                {variables[lang].USD}
              </div>
            </div>
            <div
              className={`${styles.portfolio__element} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.portfolio__element__upper__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div className={`${styles.farm}`} /> {"Farm Balance"}
              </div>
              <div
                className={`${styles.portfolio__element__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {commaSeparator(
                  Number(totalFarmBalance || 0).toFixed(DOLLAR_DECIMALS)
                )}{" "}
                {variables[lang].USD}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${styles.portfolio__table} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <PortifolioTab />
        </div>
      </div>
    </div>
  );
};

Portfolio.propTypes = {
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
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    poolBalance: state.account.balances.pool,
    address: state.account.address,
  };
};

const actionsToProps = {
  setAccountBalances,
  setMarkets,
  setLPPrices,
  setPools,
  setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(Portfolio);
