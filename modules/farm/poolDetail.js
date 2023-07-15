import styles from "./Farm.module.scss";
import { NextImage } from "../../shared/image/NextImage";
import { message } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { setTradeData } from "../../actions/tradePair";
import {
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
} from "../../services/liquidity/query";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getDenomBalance,
} from "../../utils/coin";
import PoolTokenValue from "./PoolTokenValue";

const PoolDetails = ({
  address,
  theme,
  active,
  pool,
  poolDetails,
  iconList,
  assetMap,
  balances,
  refreshBalance,
  userLiquidityInPools,
  setTradeData,
}) => {
  const [providedTokens, setProvidedTokens] = useState();
  const [queuedSoftLocks, setQueuedSoftLocks] = useState(0);
  const [activeSoftLock, setActiveSoftLock] = useState(0);

  const showPairDenoms = () => {
    if (pool?.balances?.baseCoin?.denom) {
      return `${denomConversion(
        pool?.balances?.baseCoin?.denom
      )}/${denomConversion(pool?.balances?.quoteCoin?.denom)}`;
    }
  };

  const showPoolBalance = (list, denom) => {
    let denomBalance =
      list && Object.values(list)?.filter((item) => item.denom === denom)[0];

    return `${amountConversionWithComma(
      denomBalance?.amount || 0,
      assetMap[denomBalance?.denom]?.decimals
    )} ${denomConversion(denom)}`;
  };

  const showPoolBalance2 = (list, denom) => {
    let denomBalance =
      list && Object.values(list)?.filter((item) => item.denom === denom)[0];

    return `${Number(
      amountConversion(
        denomBalance?.amount || 0,
        assetMap[denomBalance?.denom]?.decimals
      )
    )
      .toFixed(2)
      .toString()} ${denomConversion(denom)}`;
  };

  const userPoolTokens = getDenomBalance(balances, pool?.poolCoinDenom) || 0;
  const queuedAmounts =
    queuedSoftLocks && queuedSoftLocks.length > 0
      ? queuedSoftLocks?.map((item) => item?.poolCoin?.amount)
      : 0;

  const userLockedPoolTokens =
    Number(
      queuedAmounts?.length > 0 &&
        queuedAmounts?.reduce((a, b) => Number(a) + Number(b), 0)
    ) + Number(activeSoftLock?.amount) || 0;

  const fetchSoftLock = useCallback(() => {
    queryPoolSoftLocks(address, pool?.id, (error, result) => {
      if (error) {
        return;
      }

      setActiveSoftLock(result?.activePoolCoin);
      setQueuedSoftLocks(result?.queuedPoolCoin);
    });
  }, [address, pool?.id]);

  const fetchProvidedCoins = useCallback(() => {
    queryPoolCoinDeserialize(
      pool?.id,
      Number(userPoolTokens) + userLockedPoolTokens,
      (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setProvidedTokens(result?.coins);
      }
    );
  }, [pool?.id, userLockedPoolTokens, userPoolTokens]);

  useEffect(() => {
    if (pool?.id) {
      fetchProvidedCoins();
    }
  }, [pool?.id, fetchProvidedCoins]);

  useEffect(() => {
    if (address && pool?.id) {
      fetchSoftLock();
    }

    setTradeData({
      baseCoin: pool?.balances?.baseCoin?.denom,
      quoteCoin: pool?.balances?.quoteCoin?.denom,
    });
  }, [address, pool, refreshBalance, fetchSoftLock]);

  return (
    <div>
      <div
        className={`${styles.liquidityCard__pool__details} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.liquidityCard__pool__title} ${styles.title} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          {"Pool Details"}
        </div>
        <div
          className={`${styles.liquidityCard__pool__details__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__left__logo__wrap} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__logo} ${
                styles.first
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <NextImage
                  src={
                    iconList?.[pool?.balances?.baseCoin?.denom]?.coinImageUrl
                  }
                  width={50}
                  height={50}
                  alt=""
                />
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__left__logo} ${
                styles.last
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <NextImage
                  src={
                    iconList?.[pool?.balances?.quoteCoin?.denom]?.coinImageUrl
                  }
                  width={50}
                  height={50}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div
            className={`${styles.liquidityCard__pool__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {showPairDenoms()}
          </div>
        </div>

        <div
          className={`${styles.liquidityCard__pool__footer__details} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.liquidityCard__pool__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.liquidityCard__pool__title} ${
                styles.semiTitle
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {`${denomConversion(pool?.balances?.baseCoin?.denom)} - 50% `}
            </div>
            <div
              className={`${styles.liquidityCard__pool__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {pool?.balances?.baseCoin?.denom &&
                showPoolBalance(
                  poolDetails?.balances
                    ? poolDetails?.balances
                    : pool?.balances,
                  pool?.balances?.baseCoin?.denom
                )}
            </div>
          </div>
          <div
            className={`${styles.liquidityCard__pool__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.liquidityCard__pool__title} ${
                styles.semiTitle
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {`${denomConversion(pool?.balances?.quoteCoin?.denom)} - 50% `}
            </div>
            <div
              className={`${styles.liquidityCard__pool__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {pool?.balances?.quoteCoin?.denom &&
                showPoolBalance(
                  poolDetails?.balances
                    ? poolDetails?.balances
                    : pool?.balances,
                  pool?.balances?.quoteCoin?.denom
                )}
            </div>
          </div>
        </div>
        <div
          className={`${styles.liquidityCard__pool__footer__details__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.liquidityCard__pool__title} ${styles.title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Your Details"}
          </div>
          <div
            className={`${styles.liquidityCard__pool__footer__details} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.liquidityCard__pool__element} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  styles.semiTitle2
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"My Amount"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {pool?.balances?.baseCoin?.denom &&
                  showPoolBalance2(
                    providedTokens,
                    pool?.balances?.baseCoin?.denom
                  )}{" "}
                +{" "}
                {pool?.balances?.quoteCoin?.denom &&
                  showPoolBalance2(
                    providedTokens,
                    pool?.balances?.quoteCoin?.denom
                  )}
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__element} ${
                styles.semiTitle
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  styles.semiTitle2
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"Available LP Amount"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <PoolTokenValue poolTokens={userPoolTokens} />
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__element} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  styles.semiTitle2
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"Farming Amount"}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <PoolTokenValue poolTokens={userLockedPoolTokens} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PoolDetails.propTypes = {
  refreshBalance: PropTypes.number.isRequired,
  setTradeData: PropTypes.func,
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
  }),
  assetMap: PropTypes.object,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    assetMap: state.asset.map,
    poolDetails: state.liquidity.pool._,
    iconList: state.config?.iconList,
    assetMap: state.asset.map,
    balances: state.account.balances.list,
    refreshBalance: state.account.refreshBalance,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
  };
};

const actionsToProps = {
  setTradeData,
};

export default connect(stateToProps, actionsToProps)(PoolDetails);
