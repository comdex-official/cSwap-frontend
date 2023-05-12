
import Table from "../../shared/components/table/Table"
// import Table from "@/shared/components/table/Table"

import * as PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Icon } from "../../shared/image/Icon"
import { NextImage } from "../../shared/image/NextImage"
import { useState } from "react"
import styles from "./Farm.module.scss"
import { ATOM, CMDS, Cup, Current, Pyramid, Ranged } from "../../shared/image"
import dynamic from "next/dynamic"
import { Modal, Tooltip } from "antd"
import Liquidity from "./Liquidity"
import Card from "../../shared/components/card/Card"
import { setUserLiquidityInPools } from "../../actions/liquidity";
import { DOLLAR_DECIMALS, PRICE_DECIMALS } from "../../constants/common";
import { amountConversion, commaSeparatorWithRounding, denomConversion, getDenomBalance } from "../../utils/coin";
import { commaSeparator, decimalConversion, marketPrice } from "../../utils/number";
import { queryPoolCoinDeserialize, queryPoolSoftLocks } from "../../services/liquidity/query";
import RangeTooltipContent from "../../shared/components/range/RangedToolTip";

const FarmTable = ({
  theme,
  lang,
  pool,
  markets,
  setUserLiquidityInPools,
  userLiquidityInPools,
  address,
  balances,
  rewardsMap,
  parent,
  assetMap,
  poolsApr,
  iconList,
}) => {

  const [showMoreData, setshowMoreData] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSinglePool, setSelectedSinglePool] = useState();

  const showModal = (_value) => {
    setSelectedSinglePool(_value)
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // console.log(pool, "pool");
  // console.log(poolsApr, "poolsApr");

  const getMasterPool = () => {
    const hasMasterPool = poolsApr?.incentive_rewards?.some(pool => pool.master_pool);
    return hasMasterPool;
  }

  const checkExternalIncentives = () => {
    if (poolsApr?.incentive_rewards?.length > 0) {
      const hasExternalIncentive = poolsApr?.incentive_rewards?.some(pool => !pool.master_pool && pool?.apr);
      return hasExternalIncentive;
    }
    else {
      return false
    }
  }

  const calculatePoolLiquidity = useCallback(
    (poolBalance) => {
      if (poolBalance && Object.values(poolBalance)?.length) {
        const values = Object.values(poolBalance).map(
          (item) =>
            Number(
              amountConversion(item?.amount, assetMap[item?.denom]?.decimals)
            ) * marketPrice(markets, item?.denom)
        );
        return values?.reduce((prev, next) => prev + next, 0); // returning sum value
      } else return 0;
    },
    [markets, assetMap]
  );

  // const TotalPoolLiquidity = commaSeparatorWithRounding(
  //   calculatePoolLiquidity(pool?.balances),
  //   DOLLAR_DECIMALS
  // );

  const showPairDenoms = (_item) => {
    if (_item?.balances?.baseCoin?.denom) {
      return `${denomConversion(
        _item?.balances?.baseCoin?.denom
      )}-${denomConversion(_item?.balances?.quoteCoin?.denom)}`;
    }
  };

  const getUserLiquidity = useCallback(
    (pool) => {
      if (address) {
        queryPoolSoftLocks(address, pool?.id, (error, result) => {
          if (error) {
            message.error(error);
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
    [address, assetMap, balances, markets]
  );

  useEffect(() => {
    // fetching user liquidity for my pools.
    if (pool?.id) {
      getUserLiquidity(pool);
    }
  }, [pool, getUserLiquidity]);

  const COLUMNS = [
    {
      Header: "Pool Pair",
      accessor: "PoolPair",
      Cell: ({ row, value }) => (
        <div
          className={`${styles.farmCard__table__data__wrap} ${theme === "dark" ? styles.dark : styles.light
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
                <NextImage src={iconList?.[value?.balances?.baseCoin?.denom]?.coinImageUrl} width={50} height={50} alt="" />
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
                <NextImage src={iconList?.[value?.balances?.quoteCoin?.denom]?.coinImageUrl} width={50} height={50} alt="" />
              </div>
            </div>
          </div>

          <div
            className={`${styles.farmCard__element__left__title} ${styles.tableActive
              } ${theme === "dark" ? styles.dark : styles.light}`}
          >
            {showPairDenoms(value)}
          </div>

          <div
            className={`${styles.farmCard__element__right} ${styles.tableActive
              } ${theme === "dark" ? styles.dark : styles.light}`}
          >
            <div
              className={`${styles.farmCard__element__right__main} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {value?.type === 2
                ?

                <div
                  className={`${styles.farmCard__element__right__basic} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.farmCard__element__right__basic__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"Ranged"}
                  </div>

                </div>

                : value?.type === 1
                  ?
                  <div
                    className={`${styles.farmCard__element__right__basic} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    <div
                      className={`${styles.farmCard__element__right__basic__title
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      {"Basic"}
                    </div>

                  </div>
                  : ""}
              {/* <div
                className={`${styles.farmCard__element__right__basic} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__right__basic__title
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {"Basic"}
                </div>
                {false && (
                  <div
                    className={`${styles.farmCard__element__right__ranged__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    <NextImage src={Ranged} alt="Pool" />
                    {"Ranged"}
                  </div>
                )}
              </div> */}


              <div
                className={`${styles.farmCard__element__right__pool} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__right__pool__title
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {getMasterPool() ?
                    <div
                      className={`${styles.farmCard__element__right__pool__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Pyramid} alt="Logo" />
                      {'Master Pool'}
                    </div>
                    :
                    <div
                      className={`${styles.farmCard__element__right__pool__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Current} alt="Logo" />
                      {'MP Boost'}
                    </div>

                  }
                </div>

              </div>
              {/* <div
                className={`${styles.farmCard__element__right__pool} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__right__pool__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <NextImage src={Pyramid} alt="Logo" />
                  {"Master Pool"}
                </div>

                {false && (
                  <div
                    className={`${styles.farmCard__element__right__pool__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    <NextImage src={Current} alt="Logo" />
                    {"MP Boost"}
                  </div>
                )}
              </div> */}
            </div>
            <div
              className={`${styles.farmCard__element__right__incentive} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {checkExternalIncentives() && <div
                className={`${styles.farmCard__element__right__incentive} ${theme === 'dark' ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__right__pool__title} ${theme === 'dark' ? styles.dark : styles.light
                    }`}
                >
                  <NextImage src={Cup} alt="Logo" />
                  {'External Incentives'}
                </div>
              </div>}
            </div>
            {/* <div
              className={`${styles.farmCard__element__right__incentive} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__right__pool__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <NextImage src={Cup} alt="Logo" />
                {"External Incentives"}
              </div>
            </div> */}
          </div>
        </div>
      )
    },
    {
      Header: "APR",
      accessor: "APR",
      Cell: ({ value }) => (
        <div
          className={`${styles.farmCard__element__right__details} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.farmCard__element__right__details__title} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            {value}%
            <Icon className={"bi bi-arrow-right"} />
          </div>
          <div
            className={`${styles.farmCard__element__right__pool} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__right__pool__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <NextImage src={Current} alt="Logo" />
              {"Upto 54.45%"}
            </div>
          </div>
        </div>
      )
    },
    {
      Header: "Total Liquidity",
      accessor: "TotalLiquidity",
      Cell: ({ value }) => (
        <div
          className={`${styles.liquidity__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.farmCard__element__right__title} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            {/* ${value} */}
            ${commaSeparatorWithRounding(
              calculatePoolLiquidity(value?.balances),
              DOLLAR_DECIMALS
            )}
          </div>

          <div
            className={`${styles.farmCard__buttonWrap} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <button onClick={() => showModal(value)}>Add Liquidity</button>
          </div>
        </div>
      )
    }
  ]

  const DATA = pool && pool?.map((item) => {
    return {
      PoolPair: item,
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: item
    }
  })



  return <>
    <Table columns={COLUMNS} data={DATA} />

    <Modal
      className={"modal__wrap"}
      title="Liquidity"
      open={isModalOpen}
      onCancel={handleCancel}
    >
      <Liquidity theme={theme} pool={selectedSinglePool} />
    </Modal>
  </>
}

FarmTable.propTypes = {
  setUserLiquidityInPools: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  lang: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  parent: PropTypes.string,
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
    reserveCoinDenoms: PropTypes.array,
  }),
  poolIndex: PropTypes.number,
  rewardsMap: PropTypes.object,
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    markets: state.oracle.market.list,
    rewardsMap: state.liquidity.rewardsMap,
    lang: state.language,
    balances: state.account.balances.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    assetMap: state.asset.map,
    iconList: state.config?.iconList,
  };
};

const actionsToProps = {
  setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(FarmTable);
// export default FarmTable
