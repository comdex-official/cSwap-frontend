import * as PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Icon } from "../../shared/image/Icon"
import { NextImage } from "../../shared/image/NextImage"
import { useState } from "react"
import styles from "./Farm.module.scss"
import { ATOM, CMDS, Cup, Current, Pyramid, Ranged } from "../../shared/image"
import dynamic from "next/dynamic"
import { Modal, Tooltip, message } from "antd"
import Liquidity from "./Liquidity"
import Card from "../../shared/components/card/Card"
import { setUserLiquidityInPools } from "../../actions/liquidity";
import { DOLLAR_DECIMALS, PRICE_DECIMALS } from "../../constants/common";
import { amountConversion, commaSeparatorWithRounding, denomConversion, fixedDecimal, getDenomBalance } from "../../utils/coin";
import { commaSeparator, decimalConversion, marketPrice } from "../../utils/number";
import { queryPoolCoinDeserialize, queryPoolSoftLocks } from "../../services/liquidity/query";
import RangeTooltipContent from "../../shared/components/range/RangedToolTip";

// const Card = dynamic(() => import("@/shared/components/card/Card"))

const FarmCard = ({
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

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }
  console.log(poolsApr, "poolsApr");

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

  const calculateMasterPoolApr = () => {
    const totalMasterPoolApr = poolsApr?.incentive_rewards
      .filter((reward) => reward.master_pool)
    // .reduce((acc, reward) => acc + reward.apr, 0);

    // console.log(totalMasterPoolApr?.[0]?.apr, "totalMasterPoolApr");
    return fixedDecimal(totalMasterPoolApr?.[0]?.apr)
  }

  const calculateChildPoolApr = () => {
    const totalApr = poolsApr?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = poolsApr?.swap_fee_rewards.reduce(
      (acc, reward) => acc + reward.apr,
      0
    );
    const total = totalApr + swapFeeApr;
    // console.log(total, "Total chaild pool apr");
    return fixedDecimal(total);
  }

  const calculateApr = () => {
    getMasterPool()
    if (getMasterPool()) {
      return calculateMasterPoolApr()
    } else {
      return calculateChildPoolApr()
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

  const TotalPoolLiquidity = commaSeparatorWithRounding(
    calculatePoolLiquidity(pool?.balances),
    DOLLAR_DECIMALS
  );

  const showPairDenoms = () => {
    if (pool?.balances?.baseCoin?.denom) {
      return `${denomConversion(
        pool?.balances?.baseCoin?.denom
      )}-${denomConversion(pool?.balances?.quoteCoin?.denom)}`;
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

  return (
    <div
      className={`${styles.farmCard__wrap} ${theme === "dark" ? styles.dark : styles.light
        }`}
    >
      <Card>
        <div
          className={`${styles.farmCard__main} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__left} ${theme === "dark" ? styles.dark : styles.light
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
                    <NextImage src={iconList?.[pool?.balances?.baseCoin?.denom]?.coinImageUrl} width={50} height={50} alt="" />
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
                    <NextImage src={iconList?.[pool?.balances?.quoteCoin?.denom]?.coinImageUrl} width={50} height={50} alt="" />
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farmCard__element__left__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {showPairDenoms()}
              </div>
              <div
                className={`${styles.farmCard__element__left__description} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {`Pool #${pool?.id?.toNumber()}`}
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__right} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__right__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >

                <div className="ranged-box">
                  <div className="ranged-box-inner">
                    {/* <Tooltip
                      overlayClassName="ranged-tooltip ranged-tooltip-small"
                      title={
                        pool?.type === 2 ? (
                          <RangeTooltipContent
                            parent={"pool"}
                            price={Number(decimalConversion(pool?.price)).toFixed(
                              PRICE_DECIMALS
                            )}
                            max={Number(decimalConversion(pool?.maxPrice)).toFixed(
                              PRICE_DECIMALS
                            )}
                            min={Number(decimalConversion(pool?.minPrice)).toFixed(
                              PRICE_DECIMALS
                            )}
                          />
                        ) : null
                      }
                      placement="bottom"
                    > */}
                    {pool?.type === 2
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

                      : pool?.type === 1
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
                    {/* {pool?.type === 2 ? (
                        // <SvgIcon name="info-icon" viewbox="0 0 9 9" /> 
                        <Icon className={"bi bi-arrow-right"} />
                      ) : null} */}
                    {/* </Tooltip> */}
                  </div>
                </div>


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
              </div>
              <div
                className={`${styles.farmCard__element__right__incentive} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {checkExternalIncentives() &&
                  <div
                    className={`${styles.farmCard__element__right__pool__title} ${theme === 'dark' ? styles.dark : styles.light
                      }`}
                  >
                    <NextImage src={Cup} alt="Logo" />
                    {'External Incentives'}
                  </div>
                }
              </div>
            </div>
          </div>
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"APR"}
            </div>
            <div
              className={`${styles.farmCard__element__right__details} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__right__details__title
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {/* {"14.45%"} */}
                {calculateApr()} %
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
          </div>
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"Total Liquidity"}
            </div>
            <div
              className={`${styles.farmCard__element__right__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {`$${TotalPoolLiquidity}`}
            </div>
          </div>
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__boost__left} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__boost__left__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"MP Boost"}
              </div>
              <div
                className={`${styles.farmCard__element__boost__left__description
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"Upto +40%"}
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__boost__right} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"Go to Pool"}
            </div>
          </div>

          <div
            className={`${styles.farmCard__buttonWrap} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <button onClick={() => showModal()}>Add Liquidity</button>
          </div>

          <div
            className={`${styles.farmCard__details} ${theme === "dark" ? styles.dark : styles.light
              }`}
            onClick={() => setshowMoreData(!showMoreData)}
          >
            <div
              className={`${styles.farmCard__details__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {showMoreData ? "Hide Details" : "Show Details"}
            </div>

            {showMoreData ? (
              <Icon className={"bi bi-chevron-up"} size={"1.2rem"} />
            ) : (
              <Icon className={"bi bi-chevron-down"} size={"1.2rem"} />
            )}
          </div>

          {showMoreData && (
            <div
              className={`${styles.farmCard__footer__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__footer__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"Estimated rewards earned per day"}
                </div>
                <div
                  className={`${styles.farmCard__footer__rewards} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.farmCard__footer__rewards__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    <NextImage src={ATOM} alt="" /> {"0.000000"}
                  </div>
                  <div
                    className={`${styles.farmCard__footer__rewards__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    <NextImage src={CMDS} alt="" /> {"0.000000"}
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farmCard__footer__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {`${showPairDenoms()} LP Farmed`}
                </div>
                <div
                  className={`${styles.farmCard__footer__right__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  $
                  {commaSeparator(
                    Number(userLiquidityInPools[pool?.id] || 0).toFixed(
                      DOLLAR_DECIMALS
                    )
                  )}
                </div>
              </div>
              {getMasterPool() && <div
                className={`${styles.farmCard__footer__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {`${showPairDenoms()} LP Farmed (Master Pool)`}
                </div>
                <div
                  className={`${styles.farmCard__footer__right__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {" "}
                  {"$150.000"}
                </div>
              </div>}
            </div>
          )}

          <Modal
            className={"modal__wrap"}
            title="Liquidity"
            open={isModalOpen}
            onCancel={handleCancel}
          >
            <Liquidity theme={theme} pool={pool} />
          </Modal>
        </div>
      </Card>
    </div>
  )
}

FarmCard.propTypes = {
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

export default connect(stateToProps, actionsToProps)(FarmCard);
