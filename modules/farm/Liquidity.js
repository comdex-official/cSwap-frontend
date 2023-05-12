// import React, { useState } from "react"
import styles from "./Farm.module.scss"
import { NextImage } from "../../shared/image/NextImage"
import { ATOM, CMDS } from "../../shared/image"
import { Icon } from "../../shared/image/Icon"
import dynamic from "next/dynamic"
import RangeTooltipContent from "../../shared/components/range/RangedToolTip"
import Tab from "../../shared/components/tab/Tab"

import { Button, message, Tabs } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import MediaQuery from "react-responsive";
import { useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  setFetchBalanceInProgress,
  setPool,
  setPoolBalance,
  setSpotPrice,
  setUserLiquidityInPools
} from "../../actions/liquidity";
// import { Col, Row, SvgIcon } from "../../../components/common";
// import TooltipIcon from "../../../components/TooltipIcon";
// import { DOLLAR_DECIMALS } from "../../../constants/common";
import { queryAllBalances } from "../../services/bank/query";
import {
  queryPool,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks
} from "../../services/liquidity/query";
// import {
//   amountConversion,
//   amountConversionWithComma,
//   commaSeparatorWithRounding,
//   denomConversion,
//   getDenomBalance
// } from "../../../utils/coin";
// import { commaSeparator, marketPrice } from "../../../../../utils/number";
// import { decode, iconNameFromDenom } from "../../../utils/string";
// import "../index.scss";
// import ShowAPR from "../ShowAPR";
// import Deposit from "./Deposit";
// import Farm from "./Farm";
// import "./index.scss";
// import PoolTokenValue from "./PoolTokenValue";

// const Tab = dynamic(() => import("@/shared/components/tab/Tab"))

const Liquidity = ({
  theme,
  address,
  setPool,
  pool,
  setPoolBalance,
  setFetchBalanceInProgress,
  setSpotPrice,
  refreshBalance,
  markets,
  balances,
  setUserLiquidityInPools,
  userLiquidityInPools,
  assetMap,
  rewardsMap,
}) => {
  const TabData = ["DEPOSIT", "WITHDRAW"]

  const [active, setActive] = useState("DEPOSIT")

  const [providedTokens, setProvidedTokens] = useState();
  const [activeSoftLock, setActiveSoftLock] = useState(0);
  const [queuedSoftLocks, setQueuedSoftLocks] = useState(0);

  const handleActive = item => {
    setActive(item)
  }

  return (
    <div
      className={`${styles.liquidityCard__wrap} ${theme === "dark" ? styles.dark : styles.light
        }`}
    >
      <div
        className={`${styles.liquidityCard__tab} ${theme === "dark" ? styles.dark : styles.light
          }`}
      >
        <div
          className={`${styles.liquidityCard__tab__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <Tab data={TabData} active={active} handleActive={handleActive} />
        </div>
        <div
          className={`${styles.liquidityCard__trade__pair} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          {"Trade Pair"}
        </div>
      </div>

      {active === "DEPOSIT" ? (
        <>
          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"Provide CMDX"}
                </div>

                <div className={styles.tradeCard__body__right__el1}>
                  <div
                    className={`${styles.tradeCard__body__right__el1__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"Available"} <span>{"1.99 ATOM"}</span>
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__description
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"MAX"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__footer} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"HALF"}
                  </div>
                </div>
              </div>

              <div className={styles.tradeCard__body__right}>
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage src={ATOM} alt="Logo_Dark" />
                    </div>
                  </div>

                  <div
                    className={`${styles.tradeCard__body__left__item__details__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"ATOM"}
                  </div>
                  <Icon className={`bi bi-chevron-down`} />
                </div>

                <div>
                  <div
                    className={`${styles.tradeCard__body__right__el2} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"0.00000"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el3} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"~ $0.00"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el4} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"1 ATOM = 207.727462 CMDX"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"Provide ATOM"}
                </div>

                <div className={styles.tradeCard__body__right__el1}>
                  <div
                    className={`${styles.tradeCard__body__right__el1__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"Available"} <span>{"1.99 ATOM"}</span>
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__description
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"MAX"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__footer} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"HALF"}
                  </div>
                </div>
              </div>

              <div className={styles.tradeCard__body__right}>
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage src={ATOM} alt="Logo_Dark" />
                    </div>
                  </div>

                  <div
                    className={`${styles.tradeCard__body__left__item__details__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"ATOM"}
                  </div>
                  <Icon className={`bi bi-chevron-down`} />
                </div>

                <div>
                  <div
                    className={`${styles.tradeCard__body__right__el2}  ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"0.00000"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el3} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"~ $0.00"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el4} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"1 ATOM = 207.727462 CMDX"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className={`${styles.liquidityCard__pool__withdraw__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.liquidityCard__pool__withdraw__title} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            {"Amount to Withdraw"}
          </div>
          <div
            className={`${styles.liquidityCard__pool__input} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <RangeTooltipContent />
          </div>
          <div
            className={`${styles.liquidityCard__pool__withdraw__footer} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.liquidityCard__pool__withdraw__element} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.liquidityCard__pool__withdraw__element__title
                  } ${styles.title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"Tokens to be Withdrawn"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__withdraw__element__title
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"$0.00 ≈ 0 PoolToken"}
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__withdraw__element} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.liquidityCard__pool__withdraw__element__title
                  } ${styles.title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"You have"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__withdraw__element__title
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"$0.00 ≈ 0 PoolToken"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${styles.liquidityCard__pool__details} ${theme === "dark" ? styles.dark : styles.light
          }`}
      >
        <div
          className={`${styles.liquidityCard__pool__title} ${styles.title} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          {"Pool Details"}
        </div>
        <div
          className={`${styles.liquidityCard__pool__details__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.farmCard__element__left__logo__wrap} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__left__logo} ${styles.first
                } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <NextImage src={CMDS} alt="" />
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__left__logo} ${styles.last
                } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <NextImage src={ATOM} alt="" />
              </div>
            </div>
          </div>
          <div
            className={`${styles.liquidityCard__pool__title} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            {"CMDX/ATOM"}
          </div>
        </div>

        <div
          className={`${styles.liquidityCard__pool__footer__details} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.liquidityCard__pool__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.liquidityCard__pool__title} ${styles.semiTitle
                } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {"CMDX-50%"}
            </div>
            <div
              className={`${styles.liquidityCard__pool__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"2,446,148.9 CMDX"}
            </div>
          </div>
          <div
            className={`${styles.liquidityCard__pool__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.liquidityCard__pool__title} ${styles.semiTitle
                } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {"ATOM-50%"}
            </div>
            <div
              className={`${styles.liquidityCard__pool__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"16,259,599.7 ATOM"}
            </div>
          </div>
        </div>
        <div
          className={`${styles.liquidityCard__pool__footer__details__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.liquidityCard__pool__title} ${styles.title} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            {"Your Details"}
          </div>
          <div
            className={`${styles.liquidityCard__pool__footer__details} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.liquidityCard__pool__element} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${styles.semiTitle
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"My Amount"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"22.385608 CMDX"}
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__element} ${styles.semiTitle
                } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${styles.semiTitle
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"My Amount"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"0.148797 ATOM"}
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__element} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${styles.semiTitle
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"LP Amount"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"$ 342.242"}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${styles.tradeCard__button__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <button>
            {active === "DEPOSIT" ? "Deposit & Farm" : "Withdraw & Unfarm"}
          </button>
        </div>
      </div>
    </div>
  )
}

Liquidity.propTypes = {
  refreshBalance: PropTypes.number.isRequired,
  setFetchBalanceInProgress: PropTypes.func.isRequired,
  setPool: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setSpotPrice: PropTypes.func.isRequired,
  setUserLiquidityInPools: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  inProgress: PropTypes.bool,
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
  userLiquidityInPools: PropTypes.object,
  rewardsMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    inProgress: state.liquidity.inProgress,
    pools: state.liquidity.pool.list,
    // pool: state.liquidity.pool._,
    refreshBalance: state.account.refreshBalance,
    balances: state.account.balances.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    markets: state.oracle.market.list,
    assetMap: state.asset.map,
    rewardsMap: state.liquidity.rewardsMap,
  };
};

const actionsToProps = {
  setPool,
  setPoolBalance,
  setFetchBalanceInProgress,
  setSpotPrice,
  setUserLiquidityInPools,
};


export default connect(stateToProps, actionsToProps)(Liquidity);
