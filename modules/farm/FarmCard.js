import * as PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { Icon } from '../../shared/image/Icon';
import { NextImage } from '../../shared/image/NextImage';
import { useState } from 'react';
import styles from './Farm.module.scss';
import {
  Current,
  Emission,
  HirborLogo,
  Pin,
  Pyramid,
  RangeGreen,
  RangeRed,
} from '../../shared/image';
import { Modal, Tooltip, message } from 'antd';
import Liquidity from './Liquidity';
import Card from '../../shared/components/card/Card';
import {
  setUserLiquidityInPools,
  setShowMyPool,
} from '../../actions/liquidity';
import { DOLLAR_DECIMALS, PRICE_DECIMALS } from '../../constants/common';
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
  fixedDecimal,
  getDenomBalance,
} from '../../utils/coin';
import {
  commaSeparator,
  decimalConversion,
  formatNumber,
  marketPrice,
} from '../../utils/number';
import {
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
} from '../../services/liquidity/query';
import RangeTooltipContent from '../../shared/components/range/RangedToolTip';

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
  userCurrentProposalData,
  currentProposalAllData,
  protectedEmission,
  proposalId,
  refetch,
  setRefetch,
  myPool,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortifolioManageModalOpen, setIsPortifolioManageModalOpen] =
    useState(false);
  const [isMasterPoolModalOpen, setMasterPoolModalOpen] = useState(false);
  const [poolExternalIncentiveData, setPoolExternalIncentiveData] = useState();
  const [showMoreData, setshowMoreData] = useState(false);
  const [selectedSinglePool, setSelectedSinglePool] = useState();

  const showModal = (_value) => {
    setSelectedSinglePool(_value);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
      (reward) => !reward.master_pool
    );

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
    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let _totalLiquidity = calculatePoolLiquidity(pool?.balances);
    let harborQTY = calculateVaultEmission(Number(pool?.id));
    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(_totalLiquidity);

    return fixedDecimal(total + calculatedAPY);
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
    const eApr = calculateAPY(
      calculatePoolLiquidity(pool?.balances),
      Number(pool?.id)
    );
    const apr = getMasterPool()
      ? _totalApr?.apr
      : eApr
      ? Number(calculateApr() || 0) - Number(eApr)
      : calculateApr() || 0;

    let calculateReward =
      (Number(userLiquidityInPools[pool?.id] || 0).toFixed(DOLLAR_DECIMALS) *
        (Number(apr) / 100)) /
      365;

    return fixedDecimal(calculateReward);
  };

  const calculateRewardPerDay2 = (_totalApr) => {
    let calculateReward =
      (Number(userLiquidityInPools[pool?.id] || 0).toFixed(DOLLAR_DECIMALS) *
        (Number(_totalApr) / 100)) /
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
    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let _totalLiquidity = calculatePoolLiquidity(pool?.balances);
    let harborQTY = calculateVaultEmission(Number(pool?.id));
    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(_totalLiquidity);

    totalMasterPoolApr =
      fixedDecimal(totalMasterPoolApr) +
      fixedDecimal(totalApr) +
      fixedDecimal(calculatedAPY);
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

  useEffect(() => {
    setPoolExternalIncentiveData(poolsApr?.incentive_rewards);
  }, [poolsApr]);

  useEffect(() => {
    if (poolAprList) {
      fetchMasterPoolAprData();
    }
  }, [poolAprList]);

  useEffect(() => {
    if (showMyPool) {
      setIsPortifolioManageModalOpen(true);
    }
  }, []);

  const calculateVaultEmission = (id) => {
    let totalVoteOfPair = userCurrentProposalData?.filter(
      (item) => item?.pair_id === Number(id) + 1000000
    );

    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0;
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = protectedEmission;

    let calculatedEmission =
      (Number(totalVoteOfPair) / Number(totalWeight)) * projectedEmission;

    if (isNaN(calculatedEmission) || calculatedEmission === Infinity) {
      return 0;
    } else {
      return Number(calculatedEmission).toFixed(2);
    }
  };

  const calculateExternalPoolApr = () => {
    const totalApr = poolsApr?.incentive_rewards.filter(
      (reward) => reward?.master_pool !== true && reward?.denom !== 'ucmdx'
    );

    return totalApr;
  };

  const calculateExternalBasePoolApr = () => {
    const totalApr = poolsApr?.incentive_rewards.filter(
      (reward) => reward?.master_pool !== true && reward?.denom === 'ucmdx'
    );

    return totalApr;
  };

  const calculateAPY = (_totalLiquidity, _id) => {
    // *formula = (365 * ((Harbor qty / 7)* harbor price)) / total cmst minted
    // *harbor qty formula=(totalVoteOnIndivisualVault / TotalVoteOnAllVaults) * (TotalWeekEmission)

    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let totalMintedCMST = _totalLiquidity;
    let harborQTY = calculateVaultEmission(_id);

    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(totalMintedCMST);

    if (
      isNaN(calculatedAPY) ||
      calculatedAPY === Infinity ||
      calculatedAPY === 0
    ) {
      return 0;
    } else {
      return Number(calculatedAPY).toFixed(DOLLAR_DECIMALS);
    }
  };

  const calculatePerDollorEmissioAmount = (_id, _totalLiquidity) => {
    let totalVoteOfPair = userCurrentProposalData?.filter(
      (item) => item?.pair_id === Number(_id) + 1000000
    );
    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0;
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = protectedEmission;
    let totalLiquidity = _totalLiquidity;
    let calculatedEmission =
      (Number(totalVoteOfPair) / Number(totalWeight)) * projectedEmission;
    let calculatePerDollorValue = calculatedEmission / Number(totalLiquidity);

    if (
      isNaN(calculatePerDollorValue) ||
      calculatePerDollorValue === Infinity
    ) {
      return '--';
    } else {
      return formatNumber(
        Number(calculatePerDollorValue).toFixed(DOLLAR_DECIMALS)
      );
    }
  };

  return (
    <div
      className={`${styles.farmCard__wrap} ${
        showMoreData ? styles.card__active : ''
      } ${
        poolExternalIncentiveData &&
        showMoreData &&
        poolExternalIncentiveData.length <= 0 &&
        styles.card__active
      } 
      ${
        poolExternalIncentiveData &&
        showMoreData &&
        poolExternalIncentiveData.length > 0 &&
        styles.card__active4
      } 
      ${
        showMoreData &&
        calculateAPY(
          calculatePoolLiquidity(pool?.balances),
          Number(pool?.id)
        ) &&
        styles.card__active3
      }
      ${getMasterPool() && showMoreData && styles.card__active2}  ${
        theme === 'dark' ? styles.dark : styles.light
      }
        ${
          pool?.type === 2
            ? Number(decimalConversion(pool?.price)).toFixed(PRICE_DECIMALS) >
                Number(decimalConversion(pool?.minPrice)).toFixed(
                  PRICE_DECIMALS
                ) &&
              Number(decimalConversion(pool?.price)).toFixed(PRICE_DECIMALS) <
                Number(decimalConversion(pool?.maxPrice)).toFixed(
                  PRICE_DECIMALS
                )
              ? ''
              : styles.card__dim
            : ''
        }
      
      `}
    >
      <Card farm={true} mpool={getMasterPool()}>
        <div
          className={`${styles.farmCard__main} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          {getMasterPool() && (
            <div
              className={`${styles.pin__card} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {' '}
              <NextImage src={Pin} width={20} height={20} alt="Pin" />
            </div>
          )}
          <div
            className={`${styles.farmCard__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left} ${
                getMasterPool() ? styles.active : ''
              }  ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__wrap} ${styles.active__card}`}
              >
                <div
                  className={`${styles.farmCard__element__card__left__logo} ${
                    styles.first
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  <div
                    className={`${
                      styles.farmCard__element__card__left__logo__main
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <NextImage
                      src={
                        iconList?.[pool?.balances?.baseCoin?.denom]
                          ?.coinImageUrl
                      }
                      width={50}
                      height={50}
                      alt="Logo"
                    />
                  </div>
                </div>
                <div
                  className={`${styles.farmCard__element__card__left__logo} ${
                    styles.last
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  <div
                    className={`${
                      styles.farmCard__element__card__left__logo__main
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <NextImage
                      src={
                        iconList?.[pool?.balances?.quoteCoin?.denom]
                          ?.coinImageUrl
                      }
                      width={50}
                      height={50}
                      alt="Logo"
                    />
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farmCard__element__left__name} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farmCard__element__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {showPairDenoms()}
                </div>
              </div>

              <div
                className={`${styles.farmCard__element__left__description} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {`Pool #${pool?.id?.toNumber()}`}
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__right} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farmCard__element__right__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farmCard__element__left__right} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {getMasterPool() ? (
                    <div
                      className={`${styles.farmCard__element__right__pool}  ${
                        getMasterPool() ? styles.active : ''
                      }`}
                    >
                      <div
                        className={`${
                          styles.farmCard__element__right__pool__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        <NextImage src={Pyramid} alt="Logo" />
                        {'Master Pool'}
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                {(pool?.balances?.quoteCoin?.denom === 'ucmst' ||
                  pool?.balances?.baseCoin?.denom === 'ucmst') && (
                  <Tooltip
                    title={
                      <>
                        {`HARBOR emissions enabled. Vote on your favourite pools with veHarbor to direct emissions to this pool, vote here: `}
                        <a
                          href="https://app.harborprotocol.one/more/vote"
                          target="_blank"
                        >{`https://app.harborprotocol.one/more/vote.`}</a>
                      </>
                    }
                    overlayClassName="farm_upto_apr_tooltip"
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__emission
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Emission} alt="Emission" />
                    </div>
                  </Tooltip>
                )}

                {(pool?.balances?.quoteCoin?.denom === 'ucmst' ||
                  pool?.balances?.baseCoin?.denom === 'ucmst') && (
                  <>
                    <div
                      className={`${styles.farmCard__element__right__details} ${
                        styles.card__center
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <div
                        className={`${
                          styles.farmCard__element__apr__poll__wrap
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        <Tooltip
                          title={
                            calculateAPY(
                              calculatePoolLiquidity(pool?.balances),
                              Number(pool?.id)
                            ) ? (
                              <>
                                {`For every $1 of liquidity, you will receive `}
                                <span className="emission-amount">
                                  {calculatePerDollorEmissioAmount(
                                    Number(pool?.id),
                                    calculatePoolLiquidity(pool?.balances)
                                  )}
                                </span>
                                <NextImage
                                  src={iconList?.['uharbor']?.coinImageUrl}
                                  alt={'logo'}
                                  height={15}
                                  width={15}
                                />
                                {` at the end of this week's emissions.`}
                              </>
                            ) : (
                              <>
                                {`Farm in CMST paired pools & receive these additional rewards at the end of this weeks HARBOR emissions.`}
                              </>
                            )
                          }
                          overlayClassName="farm_upto_apr_tooltip"
                        >
                          <div
                            className={`${
                              styles.farmCard__element__right__apr_pool__title
                            }  ${styles.boost} ${
                              theme === 'dark' ? styles.dark : styles.light
                            }`}
                          >
                            <NextImage src={HirborLogo} alt="Logo" />
                            {pool?.id &&
                            calculateVaultEmission(pool?.id?.toNumber())
                              ? commaSeparator(
                                  formatNumber(
                                    calculateVaultEmission(pool?.id?.toNumber())
                                  )
                                )
                              : Number(0).toFixed(2)}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </>
                )}

                {pool?.type === 2 ? (
                  <div
                    className={`${styles.farmCard__element__right__basic} ${
                      Number(decimalConversion(pool?.price)).toFixed(
                        PRICE_DECIMALS
                      ) >
                        Number(decimalConversion(pool?.minPrice)).toFixed(
                          PRICE_DECIMALS
                        ) &&
                      Number(decimalConversion(pool?.price)).toFixed(
                        PRICE_DECIMALS
                      ) <
                        Number(decimalConversion(pool?.maxPrice)).toFixed(
                          PRICE_DECIMALS
                        )
                        ? styles.green
                        : styles.red
                    }`}
                  >
                    <div className="ranged-box">
                      <div className="ranged-box-inner">
                        <Tooltip
                          // visible={true}
                          overlayClassName="ranged-tooltip ranged-tooltip-small ranged"
                          title={
                            pool?.type === 2 ? (
                              <RangeTooltipContent
                                parent={'pool'}
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
                          <div
                            className={`${
                              styles.farmCard__element__right__basic__title
                            } ${styles.active} ${
                              theme === 'dark' ? styles.dark : styles.light
                            }`}
                          >
                            {Number(decimalConversion(pool?.price)).toFixed(
                              PRICE_DECIMALS
                            ) >
                              Number(decimalConversion(pool?.minPrice)).toFixed(
                                PRICE_DECIMALS
                              ) &&
                            Number(decimalConversion(pool?.price)).toFixed(
                              PRICE_DECIMALS
                            ) <
                              Number(decimalConversion(pool?.maxPrice)).toFixed(
                                PRICE_DECIMALS
                              ) ? (
                              <NextImage src={RangeGreen} alt="Logo" />
                            ) : (
                              <NextImage src={RangeRed} alt="Logo" />
                            )}
                            {Number(decimalConversion(pool?.price)).toFixed(
                              PRICE_DECIMALS
                            ) >
                              Number(decimalConversion(pool?.minPrice)).toFixed(
                                PRICE_DECIMALS
                              ) &&
                            Number(decimalConversion(pool?.price)).toFixed(
                              PRICE_DECIMALS
                            ) <
                              Number(decimalConversion(pool?.maxPrice)).toFixed(
                                PRICE_DECIMALS
                              ) ? (
                              <div className="success-color">{'In Range'}</div>
                            ) : (
                              <div className="warn-color">{'Out of Range'}</div>
                            )}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : pool?.type === 1 ? (
                  ''
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
          <div
            className={`${styles.farmCard__element} ${styles.apr__pool} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'APR'}
            </div>

            <Tooltip
              title={
                (getMasterPool() && myPool) || !getMasterPool() ? (
                  <>
                    <div className="upto_apr_tooltip_farm_main_container">
                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">
                          Total APR (incl. MP Rewards):
                        </span>
                        <span className="value">
                          {' '}
                          {commaSeparator(calculateUptoApr() || 0)}%
                        </span>
                      </div>

                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">
                          Base APR (
                          <NextImage
                            src={iconList?.['ucmdx']?.coinImageUrl}
                            alt={'logo'}
                            height={15}
                            width={15}
                          />{' '}
                          CMDX yield only):
                        </span>
                        {calculateExternalBasePoolApr()?.length > 0 ? (
                          calculateExternalBasePoolApr().map((item, index) => (
                            <span className="value" key={index}>
                              {commaSeparator(fixedDecimal(item?.apr) || 0)}%
                            </span>
                          ))
                        ) : (
                          <span className="value">0%</span>
                        )}
                      </div>

                      {calculateExternalPoolApr()?.length > 0 && (
                        <div className="upto_apr_tooltip_farm active">
                          <span className="text">External APR:</span>
                          <span className="value">
                            <div className="eApr">
                              {calculateExternalPoolApr().map((item, index) => (
                                <div key={index}>
                                  <NextImage
                                    src={iconList?.[item?.denom]?.coinImageUrl}
                                    alt={'logo'}
                                    height={15}
                                    width={15}
                                  />
                                  {commaSeparator(fixedDecimal(item?.apr) || 0)}
                                  %
                                </div>
                              ))}
                            </div>
                          </span>
                        </div>
                      )}

                      {calculateAPY(
                        calculatePoolLiquidity(pool?.balances),
                        Number(pool?.id)
                      ) ? (
                        <div className="upto_apr_tooltip_farm active">
                          <span className="text">Emission APY:</span>

                          <span className="value">
                            {calculateAPY(
                              calculatePoolLiquidity(pool?.balances),
                              Number(pool?.id)
                            )
                              ? calculateAPY(
                                  calculatePoolLiquidity(pool?.balances),
                                  Number(pool?.id)
                                ) + '%'
                              : null}
                          </span>
                        </div>
                      ) : (
                        ''
                      )}

                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">Swap Fee APR :</span>
                        <span className="value">
                          {' '}
                          {fixedDecimal(
                            poolsApr?.swap_fee_rewards?.[0]?.apr || 0
                          )}
                          %
                        </span>
                      </div>

                      <div className="upto_apr_tooltip_farm">
                        <span className="text">Available MP Boost:</span>
                        <span className="value">
                          {' '}
                          Upto {commaSeparator(fetchMasterPoolAprData() || 0)}%
                          for providing liquidity in the Master Pool
                        </span>
                      </div>
                    </div>
                  </>
                ) : null
              }
              overlayClassName="farm_upto_apr_tooltip"
            >
              <div
                className={`${styles.farmCard__element__right__details} ${
                  styles.card__center
                } ${
                  (getMasterPool() && myPool) || !getMasterPool()
                    ? styles.cursor
                    : ''
                }`}
              >
                <div
                  className={`${
                    styles.farmCard__element__right__details__title
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {getMasterPool() && myPool
                    ? `${commaSeparator(calculateChildPoolApr() || 0)}%`
                    : `${commaSeparator(calculateApr() || 0)}%`}
                  {getMasterPool() && myPool ? (
                    <Icon className={'bi bi-arrow-right'} />
                  ) : !getMasterPool() ? (
                    <Icon className={'bi bi-arrow-right'} />
                  ) : (
                    ''
                  )}
                </div>
                {getMasterPool() && myPool ? (
                  <div
                    className={`${styles.farmCard__element__right__pool} ${styles.upto}`}
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__pool__title
                      } ${styles.boost} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <NextImage src={Current} alt="Logo" />

                      {`Upto ${commaSeparator(calculateUptoApr() || 0)}%`}
                    </div>
                  </div>
                ) : !getMasterPool() ? (
                  <div
                    className={`${styles.farmCard__element__right__pool} ${styles.upto}`}
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__pool__title
                      } ${styles.boost} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <NextImage src={Current} alt="Logo" />

                      {`Upto ${commaSeparator(calculateUptoApr() || 0)}%`}
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </Tooltip>
          </div>

          <div
            className={`${styles.farmCard__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Total Liquidity'}
            </div>
            <div
              className={`${styles.farmCard__element__right__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {myPool
                ? `$${commaSeparator(
                    Number(userLiquidityInPools[pool?.id] || 0).toFixed(
                      DOLLAR_DECIMALS
                    )
                  )}`
                : `$${TotalPoolLiquidity || 0}`}
            </div>
          </div>

          <div className="farmCard__button">
            <div
              className={`${styles.farmCard__buttonWrap2} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <button onClick={() => showModal(pool)}>Add Liquidity</button>
            </div>

            <div
              className={`${styles.farmCard__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
              onClick={() => setshowMoreData(!showMoreData)}
            >
              <div
                className={`${styles.farmCard__details__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {showMoreData ? 'Hide Details' : 'Show Details'}
              </div>

              {showMoreData ? (
                <Icon className={'bi bi-chevron-up'} size={'0.7rem'} />
              ) : (
                <Icon className={'bi bi-chevron-down'} size={'0.7rem'} />
              )}
            </div>
          </div>
          {showMoreData && (
            <div
              className={`${styles.farmCard__footer__wrap}  ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {poolExternalIncentiveData &&
              (poolExternalIncentiveData.length > 0 ||
                calculateAPY(
                  calculatePoolLiquidity(pool?.balances),
                  Number(pool?.id)
                )) ? (
                <div
                  className={`${styles.farmCard__footer__main} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.farmCard__footer__left__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Estimated rewards earned per day'}
                  </div>
                  <div
                    className={`${styles.farmCard__footer__rewards} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {poolExternalIncentiveData &&
                      poolExternalIncentiveData.length > 0 &&
                      poolExternalIncentiveData?.map((singleIncentive) => {
                        return (
                          <div
                            className={`${
                              styles.farmCard__footer__rewards__title
                            }
                              ${
                                poolExternalIncentiveData.length > 1
                                  ? styles.margin
                                  : ''
                              }
                              ${theme === 'dark' ? styles.dark : styles.light}`}
                            key={singleIncentive?.denom}
                          >
                            <NextImage
                              src={
                                iconList?.[singleIncentive?.denom]?.coinImageUrl
                              }
                              width={50}
                              height={50}
                              alt="Logo"
                            />{' '}
                            ${calculateRewardPerDay(singleIncentive)}
                          </div>
                        );
                      })}

                    {calculateAPY(
                      calculatePoolLiquidity(pool?.balances),
                      Number(pool?.id)
                    ) ? (
                      <div
                        className={`${styles.farmCard__footer__rewards__title}
                              ${
                                poolExternalIncentiveData.length > 0
                                  ? styles.marginTop
                                  : ''
                              }
                              ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        <NextImage
                          src={iconList?.['uharbor']?.coinImageUrl}
                          width={50}
                          height={50}
                          alt="Logo"
                        />{' '}
                        $
                        {calculateRewardPerDay2(
                          calculateAPY(
                            calculatePoolLiquidity(pool?.balances),
                            Number(pool?.id)
                          )
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div
                className={`${styles.farmCard__footer__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {`${showPairDenoms()} LP Farmed`}
                </div>
                <div
                  className={`${styles.farmCard__footer__right__title} ${
                    theme === 'dark' ? styles.dark : styles.light
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
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.farmCard__footer__left__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {`Master Pool Liquidity`}
                  </div>
                  <div
                    className={`${styles.farmCard__footer__right__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {' '}
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

              <div
                className={`${styles.farmCard__element} ${
                  getMasterPool() ? styles.active : ''
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {!getMasterPool() && (
                  <>
                    <div
                      className={`${styles.farmCard__element__boost__left} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <div
                        className={`${
                          styles.farmCard__element__boost__left__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'MP Boost'}
                      </div>
                      <Tooltip
                        title={
                          'Provide equivalent liquidity in the Master pool to earn boost'
                        }
                        overlayClassName="farm_upto_apr_tooltip"
                      >
                        <div
                          className={`${
                            styles.farmCard__element__boost__left__description
                          } ${theme === 'dark' ? styles.dark : styles.light}`}
                        >
                          {`Upto ${commaSeparator(
                            fetchMasterPoolAprData() || 0
                          )}%`}
                        </div>
                      </Tooltip>
                    </div>

                    <div
                      className={`${styles.farmCard__element__boost__right} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                      onClick={() =>
                        masterPoolData ? setMasterPoolModalOpen(true) : ''
                      }
                    >
                      {'Go to Pool'}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <Modal
            className={'modal__wrap2'}
            open={isModalOpen}
            onCancel={handleCancel}
            centered={true}
          >
            <Liquidity
              theme={theme}
              pool={selectedSinglePool}
              refetch={refetch}
              setRefetch={setRefetch}
            />
          </Modal>

          {/* For goto Pool Button  --> Master pool */}
          <Modal
            className={'modal__wrap2'}
            open={isMasterPoolModalOpen}
            onCancel={handleMasterPoolCancel}
            centered={true}
          >
            <Liquidity
              theme={theme}
              pool={masterPoolData}
              refetch={refetch}
              setRefetch={setRefetch}
            />
          </Modal>

          {/* For my pool when user navigate through portofolio manage button  */}
          {showMyPool && (
            <Modal
              className={'modal__wrap2'}
              open={isPortifolioManageModalOpen}
              onCancel={handlePortofolioManageCancel}
              centered={true}
            >
              <Liquidity
                theme={theme}
                pool={selectedManagePool}
                refetch={refetch}
                setRefetch={setRefetch}
              />
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
