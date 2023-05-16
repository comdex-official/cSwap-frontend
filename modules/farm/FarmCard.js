import * as PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Icon } from "../../shared/image/Icon";
import { NextImage } from "../../shared/image/NextImage";
import { useState } from "react";
import styles from "./Farm.module.scss";
import { ATOM, CMDS, Cup, Current, Pyramid, Ranged } from "../../shared/image";
import dynamic from "next/dynamic";
import { Modal, Tooltip, message, Slider } from "antd";
import Liquidity from "./Liquidity";
import Card from "../../shared/components/card/Card";
import {
  setUserLiquidityInPools,
  setShowMyPool,
} from "../../actions/liquidity";
import { DOLLAR_DECIMALS, PRICE_DECIMALS } from "../../constants/common";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
  fixedDecimal,
  getDenomBalance,
} from "../../utils/coin";
import {
  commaSeparator,
  decimalConversion,
  marketPrice,
} from "../../utils/number";
import {
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
} from "../../services/liquidity/query";
import RangeTooltipContent from "../../shared/components/range/RangedToolTip";
import { getAMP, rangeToPercentage } from "../../utils/number";

// const Card = dynamic(() => import("@/shared/components/card/Card"))

const FarmCard = ({
  theme,
  lang,
  pool,
  poolAprList,
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
  masterPoolData,
  showMyPool,
  selectedManagePool,
  setShowMyPool,
}) => {
  const [showMoreData, setshowMoreData] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortifolioManageModalOpen, setIsPortifolioManageModalOpen] =
    useState(false);
  const [isMasterPoolModalOpen, setMasterPoolModalOpen] = useState(false);
  const [poolExternalIncentiveData, setPoolExternalIncentiveData] = useState();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // console.log(poolsApr, "poolsApr");

  const handlePortofolioManageCancel = () => {
    setIsPortifolioManageModalOpen(false);
    setShowMyPool(false);
  };

  const handleMasterPoolCancel = () => {
    setMasterPoolModalOpen(false);
  };

  const getMasterPool = () => {
    const hasMasterPool = poolsApr?.incentive_rewards?.some(
      (pool) => pool.master_pool
    );
    return hasMasterPool;
  };

  const checkExternalIncentives = () => {
    if (poolsApr?.incentive_rewards?.length > 0) {
      const hasExternalIncentive = poolsApr?.incentive_rewards?.some(
        (pool) => !pool.master_pool && pool?.apr
      );
      return hasExternalIncentive;
    } else {
      return false;
    }
  };

  const calculateMasterPoolApr = () => {
    const totalMasterPoolApr = poolsApr?.incentive_rewards.filter(
      (reward) => reward.master_pool
    );
    // .reduce((acc, reward) => acc + reward.apr, 0);

    // console.log(totalMasterPoolApr?.[0]?.apr, "totalMasterPoolApr");
    return fixedDecimal(totalMasterPoolApr?.[0]?.apr);
  };

  const calculateChildPoolApr = () => {
    const totalApr = poolsApr?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = poolsApr?.swap_fee_rewards.reduce(
      (acc, reward) => acc + reward.apr,
      0
    );
    const total = totalApr + swapFeeApr;
    return fixedDecimal(total);
  };

  const calculateApr = () => {
    getMasterPool();
    if (getMasterPool()) {
      return calculateMasterPoolApr();
    } else {
      return calculateChildPoolApr();
    }
  };

  const calculateRewardPerDay = (_totalApr) => {
    let calculateReward =
      (Number(userLiquidityInPools[pool?.id] || 0).toFixed(DOLLAR_DECIMALS) *
        (Number(_totalApr?.apr) / 100)) /
      365;
    return fixedDecimal(calculateReward);
  };

  const fetchMasterPoolAprData = () => {
    let totalMasterPoolApr = 0;
    // This will output the total APR value for all incentive_rewards where master_pool=true
    if (poolAprList) {
      Object.values(poolAprList && poolAprList).forEach((value) => {
        const incentiveRewards = value.incentive_rewards;

        incentiveRewards.forEach((incentive) => {
          if (incentive.master_pool === true) {
            totalMasterPoolApr += incentive.apr;
          }
        });
      });
    }
    return fixedDecimal(totalMasterPoolApr);
  };

  const calculateUptoApr = () => {
    let totalApr = 0;
    let totalMasterPoolApr = fetchMasterPoolAprData();

    // calculate apr in incentive_rewards
    poolsApr?.incentive_rewards.forEach((reward) => {
      if (!reward.master_pool) {
        totalApr += reward.apr;
      }
    });

    // calculate apr in swap_fee_rewards
    poolsApr?.swap_fee_rewards.forEach((reward) => {
      totalApr += reward.apr;
    });

    totalMasterPoolApr =
      fixedDecimal(totalMasterPoolApr) + fixedDecimal(totalApr);
    return fixedDecimal(totalMasterPoolApr);
  };

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
              console.log("====================================");
              console.log(totalLiquidityInDollar, pool?.id);
              console.log("====================================");
              setUserLiquidityInPools(pool?.id, totalLiquidityInDollar || 0);
            }
          );
        });
      }
    },
    [address, assetMap, balances, markets]
  );

  useEffect(() => {
    // setPoolExternalIncentiveData(poolsApr?.incentive_rewards.filter((reward) => !reward.master_pool))
    setPoolExternalIncentiveData(poolsApr?.incentive_rewards);
  }, [poolsApr]);

  useEffect(() => {
    if (poolAprList) {
      fetchMasterPoolAprData();
    }
  }, [poolAprList]);

  useEffect(() => {
    // fetching user liquidity for my pools.
    if (pool?.id) {
      getUserLiquidity(pool);
    }
  }, [pool, getUserLiquidity]);

  useEffect(() => {
    if (showMyPool) {
      // showPortofolioManageModal()
      setIsPortifolioManageModalOpen(true);
    }
  }, []);

  return (
    <div
      className={`${styles.farmCard__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <Card>
        <div
          className={`${styles.farmCard__main} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left} ${
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
                        iconList?.[pool?.balances?.baseCoin?.denom]
                          ?.coinImageUrl
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
                        iconList?.[pool?.balances?.quoteCoin?.denom]
                          ?.coinImageUrl
                      }
                      width={50}
                      height={50}
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farmCard__element__left__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {showPairDenoms()}
              </div>
              <div
                className={`${styles.farmCard__element__left__description} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {`Pool #${pool?.id?.toNumber()}`}
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__right} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farmCard__element__right__main} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div className="ranged-box">
                  <div className="ranged-box-inner">
                    {pool?.type === 2 ? (
                      <div
                        className={`${styles.farmCard__element__right__basic} ${
                          theme === "dark" ? styles.dark : styles.light
                        }`}
                      >
                        <div className="ranged-box">
                          <div className="ranged-box-inner">
                            <Tooltip
                              overlayClassName="ranged-tooltip ranged-tooltip-small"
                              title={
                                pool?.type === 2 ? (
                                  <RangeTooltipContent
                                    parent={"pool"}
                                    price={Number(
                                      decimalConversion(pool?.price)
                                    ).toFixed(PRICE_DECIMALS)}
                                    max={Number(
                                      decimalConversion(pool?.maxPrice)
                                    ).toFixed(PRICE_DECIMALS)}
                                    min={Number(
                                      decimalConversion(pool?.minPrice)
                                    ).toFixed(PRICE_DECIMALS)}
                                  />
                                ) : null
                              }
                              placement="bottom"
                            >
                              <div
                                className={`${
                                  styles.farmCard__element__right__basic__title
                                } ${
                                  theme === "dark" ? styles.dark : styles.light
                                }`}
                              >
                                {"Ranged"}
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                        {/* <Tooltip
                          overlayClassName="ranged-tooltip "
                          visible={true}
                          delayHide={1500000}
                          title={
                            pool?.type === 2 ? (
                              <RangeTooltipContent
                                parent={"pool"}
                                price={Number(
                                  decimalConversion(pool?.price)
                                ).toFixed(PRICE_DECIMALS)}
                                max={Number(
                                  decimalConversion(pool?.maxPrice)
                                ).toFixed(PRICE_DECIMALS)}
                                min={Number(
                                  decimalConversion(pool?.minPrice)
                                ).toFixed(PRICE_DECIMALS)}
                              />
                            ) : null
                          }
                          placement="top"
                        >
                          
                        </Tooltip> */}
                      </div>
                    ) : pool?.type === 1 ? (
                      <div
                        className={`${styles.farmCard__element__right__basic} ${
                          theme === "dark" ? styles.dark : styles.light
                        }`}
                      >
                        <div
                          className={`${
                            styles.farmCard__element__right__basic__title
                          } ${theme === "dark" ? styles.dark : styles.light}`}
                        >
                          {"Basic"}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {/* {pool?.type === 2 ? (
                        // <SvgIcon name="info-icon" viewbox="0 0 9 9" /> 
                        <Icon className={"bi bi-arrow-right"} />
                      ) : null} */}
                  </div>
                </div>

                <div
                  className={`${styles.farmCard__element__right__pool} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {getMasterPool() ? (
                    <div
                      className={`${
                        styles.farmCard__element__right__pool__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Pyramid} alt="Logo" />
                      {"Master Pool"}
                    </div>
                  ) : (
                    <div
                      className={`${
                        styles.farmCard__element__right__pool__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Current} alt="Logo" />
                      {"MP Boost"}
                    </div>
                  )}
                </div>
              </div>

              {checkExternalIncentives() && (
                <div
                  className={`${styles.farmCard__element__right__incentive} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.farmCard__element__right__pool__title
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    <NextImage src={Cup} alt="Logo" />
                    {"External Incentives"}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            className={`${styles.farmCard__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"APR"}
            </div>

            <Tooltip
              title={
                !getMasterPool() ? (
                  <>
                    <div className="upto_apr_tooltip_farm_main_container">
                      <div className="upto_apr_tooltip_farm">
                        <span className="text">
                          Total APR (incl. MP Rewards):
                        </span>
                        <span className="value">
                          {" "}
                          {commaSeparator(calculateUptoApr() || 0)}%
                        </span>
                      </div>

                      <div className="upto_apr_tooltip_farm">
                        <span className="text">
                          Base APR (CMDX. yeild only):
                        </span>
                        <span className="value">
                          {" "}
                          {commaSeparator(calculateApr() || 0)}%
                        </span>
                      </div>

                      <div className="upto_apr_tooltip_farm">
                        <span className="text">Swap Fee APR :</span>
                        <span className="value">
                          {" "}
                          {fixedDecimal(
                            poolsApr?.swap_fee_rewards?.[0]?.apr || 0
                          )}
                          %
                        </span>
                      </div>

                      <div className="upto_apr_tooltip_farm">
                        <span className="text">Available MP Boost:</span>
                        <span className="value">
                          {" "}
                          Upto {commaSeparator(fetchMasterPoolAprData() || 0)}%
                          for providing liquidity in the Master Pool
                        </span>
                      </div>
                    </div>
                  </>
                ) : null
              }
              // className="farm_upto_apr_tooltip"
              overlayClassName="farm_upto_apr_tooltip"
            >
              <div
                className={`${styles.farmCard__element__right__details} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${
                    styles.farmCard__element__right__details__title
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {/* {"14.45%"} */}
                  {commaSeparator(calculateApr() || 0)} %
                  {!getMasterPool() && <Icon className={"bi bi-arrow-right"} />}
                </div>
                {!getMasterPool() && (
                  <div
                    className={`${styles.farmCard__element__right__pool} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__pool__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Current} alt="Logo" />
                      {/* {"Upto 54.45%"} */}
                      {`Upto ${commaSeparator(calculateUptoApr() || 0)} %`}
                    </div>
                  </div>
                )}
              </div>
            </Tooltip>
          </div>
          <div
            className={`${styles.farmCard__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"Total Liquidity"}
            </div>
            <div
              className={`${styles.farmCard__element__right__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {`$${TotalPoolLiquidity}`}
            </div>
          </div>
          {!getMasterPool() && (
            <div
              className={`${styles.farmCard__element} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farmCard__element__boost__left} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farmCard__element__boost__left__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"MP Boost"}
                </div>
                <Tooltip
                  title={
                    "Provide equivalent liquidity in the Master pool to earn boost"
                  }
                  // className="farm_upto_apr_tooltip"
                  overlayClassName="farm_upto_apr_tooltip"
                >
                  <div
                    className={`${
                      styles.farmCard__element__boost__left__description
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {`Upto ${commaSeparator(fetchMasterPoolAprData() || 0)} %`}
                  </div>
                </Tooltip>
              </div>

              <div
                className={`${styles.farmCard__element__boost__right} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
                onClick={() => setMasterPoolModalOpen(true)}
              >
                {"Go to Pool"}
              </div>
            </div>
          )}

          <div className="farmCard__button">
            <div
              className={`${styles.farmCard__buttonWrap2} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <button onClick={() => showModal()}>Add Liquidity</button>
            </div>

            <div
              className={`${styles.farmCard__details} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
              onClick={() => setshowMoreData(!showMoreData)}
            >
              <div
                className={`${styles.farmCard__details__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {showMoreData ? "Hide Details" : "Show Details"}
              </div>

              {showMoreData ? (
                <Icon className={"bi bi-chevron-up"} size={"0.7rem"} />
              ) : (
                <Icon className={"bi bi-chevron-down"} size={"0.7rem"} />
              )}
            </div>
          </div>
          {showMoreData && (
            <div
              className={`${styles.farmCard__footer__wrap} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {poolExternalIncentiveData.length > 0 && (
                <div
                  className={`${styles.farmCard__footer__main} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.farmCard__footer__left__title} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {"Estimated rewards earned per day"}
                  </div>
                  <div
                    className={`${styles.farmCard__footer__rewards} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {poolExternalIncentiveData?.map((singleIncentive) => {
                      return (
                        <div
                          className={`${
                            styles.farmCard__footer__rewards__title
                          } ${theme === "dark" ? styles.dark : styles.light}`}
                          key={singleIncentive?.denom}
                        >
                          <NextImage
                            src={
                              iconList?.[singleIncentive?.denom]?.coinImageUrl
                            }
                            width={50}
                            height={50}
                            alt=""
                          />{" "}
                          ${calculateRewardPerDay(singleIncentive)}
                        </div>
                      );
                    })}
                    {/* <div
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
                 </div> */}
                  </div>
                </div>
              )}

              <div
                className={`${styles.farmCard__footer__main} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {`${showPairDenoms()} LP Farmed`}
                </div>
                <div
                  className={`${styles.farmCard__footer__right__title} ${
                    theme === "dark" ? styles.dark : styles.light
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
              {!getMasterPool() && (
                <div
                  className={`${styles.farmCard__footer__main} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.farmCard__footer__left__title} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {/* {`${showPairDenoms()} LP Farmed (Master Pool)`} */}
                    {`${denomConversion(
                      masterPoolData?.balances?.baseCoin?.denom
                    )}-${denomConversion(
                      masterPoolData?.balances?.quoteCoin?.denom
                    )} LP Farmed (Master Pool)`}
                  </div>
                  <div
                    className={`${styles.farmCard__footer__right__title} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {" "}
                    $
                    {commaSeparator(
                      Number(
                        userLiquidityInPools?.[
                          masterPoolData?.id?.toNumber()
                        ] || 0
                      ).toFixed(DOLLAR_DECIMALS)
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Modal
            className={"modal__wrap2"}
            open={isModalOpen}
            onCancel={handleCancel}
            centered={true}
          >
            <Liquidity theme={theme} pool={pool} />
          </Modal>

          {/* For goto Pool Button  --> Master pool */}
          <Modal
            className={"modal__wrap2"}
            open={isMasterPoolModalOpen}
            onCancel={handleMasterPoolCancel}
            centered={true}
          >
            <Liquidity theme={theme} pool={masterPoolData} />
          </Modal>

          {/* For my pool when user navigate through portofolio manage button  */}
          {showMyPool && (
            <Modal
              className={"modal__wrap2"}
              open={isPortifolioManageModalOpen}
              onCancel={handlePortofolioManageCancel}
              centered={true}
            >
              <Liquidity theme={theme} pool={selectedManagePool} />
            </Modal>
          )}
        </div>
      </Card>
    </div>
  );
};

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
    selectedManagePool: state.liquidity.selectedManagePool,
    showMyPool: state.liquidity.showMyPool,
  };
};

const actionsToProps = {
  setUserLiquidityInPools,
  setShowMyPool,
};

export default connect(stateToProps, actionsToProps)(FarmCard);
