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
  Pyramid,
  RangeGreen,
  RangeRed,
} from '../../shared/image';
import { Modal, Tooltip, message, Table, Button } from 'antd';
import Liquidity from './Liquidity';
import {
  setUserLiquidityInPools,
  setShowMyPool,
} from '../../actions/liquidity';
import {
  DOLLAR_DECIMALS,
  PRICE_DECIMALS,
  PRODUCT_ID,
} from '../../constants/common';
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
  emissiondata,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
  userProposalProjectedEmission,
  votingCurrentProposal,
  votingCurrentProposalId,
} from '../../services/liquidity/query';
import RangeTooltipContent from '../../shared/components/range/RangedToolTip';
import NoDataIcon from '../../shared/components/NoDataIcon';

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
  poolAprList,
  noDataButton,
  handleClick,
  showMyPool,
  selectedManagePool,
  setShowMyPool,
  refetch,
  setRefetch,
  userLiquidityRefetch,
}) => {
  const [isPortifolioManageModalOpen, setIsPortifolioManageModalOpen] =
    useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    if (showMyPool) {
      setIsPortifolioManageModalOpen(true);
    }
  }, []);

  const getMasterPool = (_id) => {
    const hasMasterPool = poolsApr?.[_id]?.incentive_rewards?.some(
      (pool) => pool.master_pool
    );
    return hasMasterPool;
  };

  const checkExternalIncentives = (_id) => {
    if (poolsApr?.[_id]?.incentive_rewards?.length > 0) {
      const hasExternalIncentive = poolsApr?.[_id]?.incentive_rewards?.some(
        (pool) => !pool.master_pool && pool?.apr
      );
      return hasExternalIncentive;
    } else {
      return false;
    }
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

  const showPairDenoms = (_item) => {
    if (_item?.balances?.baseCoin?.denom) {
      return `${denomConversion(
        _item?.balances?.baseCoin?.denom
      )}-${denomConversion(_item?.balances?.quoteCoin?.denom)}`;
    }
  };

  const calculateMasterPoolApr = (_id) => {
    const totalMasterPoolApr = poolsApr?.[_id]?.incentive_rewards.filter(
      (reward) => !reward.master_pool
    );

    return fixedDecimal(totalMasterPoolApr?.[0]?.apr);
  };

  const calculateChildPoolApr = (_id, value) => {
    const totalApr = poolsApr?.[_id]?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = poolsApr?.[_id]?.swap_fee_rewards.reduce(
      (acc, reward) => acc + reward.apr,
      0
    );
    const total = totalApr + swapFeeApr;

    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let _totalLiquidity = calculatePoolLiquidity(value?.balances);
    let harborQTY = calculateVaultEmission(Number(value?.id));
    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(_totalLiquidity);
    return fixedDecimal(total + calculatedAPY);
  };

  const calculateApr = (_id, value) => {
    getMasterPool(_id);
    if (getMasterPool(_id)) {
      return calculateMasterPoolApr(_id);
    } else {
      return calculateChildPoolApr(_id, value);
    }
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

  const calculateUptoApr = (_id, value) => {
    let totalApr = 0;
    let totalMasterPoolApr = fetchMasterPoolAprData();

    // calculate apr in incentive_rewards
    poolsApr?.[_id]?.incentive_rewards.forEach((reward) => {
      if (!reward.master_pool) {
        totalApr += reward.apr;
      }
    });

    // calculate apr in swap_fee_rewards
    poolsApr?.[_id]?.swap_fee_rewards.forEach((reward) => {
      totalApr += reward.apr;
    });
    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let _totalLiquidity = calculatePoolLiquidity(value?.balances);
    let harborQTY = calculateVaultEmission(Number(value?.id));
    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(_totalLiquidity);

    totalMasterPoolApr =
      fixedDecimal(totalMasterPoolApr) +
      fixedDecimal(totalApr) +
      fixedDecimal(calculatedAPY);

    return fixedDecimal(totalMasterPoolApr);
  };

  const [userCurrentProposalData, setUserCurrentProposalData] = useState();
  const [currentProposalAllData, setCurrentProposalAllData] = useState();
  const [protectedEmission, setProtectedEmission] = useState(0);
  const [proposalId, setProposalId] = useState();

  useEffect(() => {
    fetchVotingCurrentProposalId();
  }, []);

  const fetchVotingCurrentProposalId = () => {
    votingCurrentProposalId(PRODUCT_ID)
      .then((res) => {
        setProposalId(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (proposalId) {
      fetchuserProposalProjectedEmission(proposalId);
      fetchVotingCurrentProposal(proposalId);
    }
  }, [address, proposalId]);

  useEffect(() => {
    if (address) {
      fetchEmissiondata(address);
    }
  }, [address]);

  const fetchuserProposalProjectedEmission = (proposalId) => {
    userProposalProjectedEmission(proposalId)
      .then((res) => {
        setProtectedEmission(amountConversion(res));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchVotingCurrentProposal = (proposalId) => {
    votingCurrentProposal(proposalId)
      .then((res) => {
        setCurrentProposalAllData(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchEmissiondata = (address) => {
    emissiondata(address, (error, result) => {
      if (error) {
        // message.error(error);
        console.log(error);
        return;
      }
      setUserCurrentProposalData(result?.data);
    });
  };

  const calculateVaultEmission = (id) => {
    let totalVoteOfPair = userCurrentProposalData?.filter(
      (item) => item?.pair_id === Number(id) + 1000000 && item?.pair_name !== ''
    );

    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0;
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = totalVoteOfPair === 0 ? 0 : protectedEmission;

    let calculatedEmission =
      (Number(totalVoteOfPair) / Number(totalWeight)) * projectedEmission;

    if (isNaN(calculatedEmission) || calculatedEmission === Infinity) {
      return 0;
    } else if (calculatedEmission === 0) {
      return 0;
    } else {
      return Number(calculatedEmission).toFixed(2);
    }
  };

  const calculateExternalPoolApr = (_id) => {
    const totalApr = poolsApr?.[_id]?.incentive_rewards?.filter(
      (reward) => reward?.master_pool !== true && reward?.denom !== 'ucmdx'
    );

    return totalApr;
  };

  const calculateExternalBasePoolApr = (_id) => {
    const totalApr = poolsApr?.[_id]?.incentive_rewards?.filter(
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
      (item) =>
        item?.pair_id === Number(_id) + 1000000 && item?.pair_name !== ''
    );
    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0;
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = protectedEmission;
    let totalLiquidity = totalVoteOfPair === 0 ? 0 : _totalLiquidity;
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
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);

  const Columns = [
    {
      title: 'Pool Pair',
      dataIndex: 'PoolPair',
      key: 'PoolPair',
      render: (value) => (
        <div
          className={`${styles.farmCard__table__data__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__left__title__logo} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__logo__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farmCard__element__left__logo} ${
                  styles.first
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.farmCard__element__left__logo__main} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage
                    src={
                      iconList?.[value?.balances?.baseCoin?.denom]?.coinImageUrl
                    }
                    alt="Logo"
                    width={50}
                    height={50}
                  />
                </div>
              </div>
              <div
                className={`${styles.farmCard__element__left__logo} ${
                  styles.last
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.farmCard__element__left__logo__main} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage
                    src={
                      iconList?.[value?.balances?.quoteCoin?.denom]
                        ?.coinImageUrl
                    }
                    alt="Logo"
                    width={50}
                    height={50}
                  />
                </div>
              </div>
            </div>

            <div
              className={`${styles.farmCard__element__left__title} ${
                styles.tableActive
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {showPairDenoms(value)}
            </div>
          </div>

          <div
            className={`${styles.farmCard__element__right__wholetab} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {(value?.balances?.quoteCoin?.denom === 'ucmst' ||
              value?.balances?.baseCoin?.denom === 'ucmst') && (
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
                  className={`${styles.farmCard__element__right__emission} ${styles.emission_img}`}
                >
                  <NextImage src={Emission} alt="Emission" />
                </div>
              </Tooltip>
            )}

            <div
              className={`${styles.farmCard__element__right} ${
                styles.tableActive
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__right__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {getMasterPool(value?.id?.toNumber()) ? (
                  <div
                    className={`${styles.farmCard__element__right__pool} ${
                      theme === 'dark' ? styles.dark : styles.light
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

                {(value?.balances?.quoteCoin?.denom === 'ucmst' ||
                  value?.balances?.baseCoin?.denom === 'ucmst') && (
                  <div
                    className={`${styles.farmCard__element__apr__poll__wrap} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <Tooltip
                      title={
                        calculateAPY(
                          calculatePoolLiquidity(value?.balances),
                          Number(value?.id)
                        ) ? (
                          <>
                            {`For every $1 of liquidity, you will receive `}
                            <span className="emission-amount">
                              {calculatePerDollorEmissioAmount(
                                Number(value?.id),
                                calculatePoolLiquidity(value?.balances)
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
                        {value?.id &&
                        calculateVaultEmission(value?.id?.toNumber())
                          ? commaSeparator(
                              formatNumber(
                                calculateVaultEmission(value?.id?.toNumber())
                              )
                            )
                          : Number(0).toFixed(2)}
                      </div>
                    </Tooltip>
                  </div>
                )}

                {value?.type === 2 ? (
                  <div
                    className={`${styles.farmCard__element__right__basic} ${
                      Number(decimalConversion(value?.price)).toFixed(
                        PRICE_DECIMALS
                      ) >
                        Number(decimalConversion(value?.minPrice)).toFixed(
                          PRICE_DECIMALS
                        ) &&
                      Number(decimalConversion(value?.price)).toFixed(
                        PRICE_DECIMALS
                      ) <
                        Number(decimalConversion(value?.maxPrice)).toFixed(
                          PRICE_DECIMALS
                        )
                        ? styles.green
                        : styles.red
                    }`}
                  >
                    <div className="ranged-box">
                      <div className="ranged-box-inner">
                        <Tooltip
                          overlayClassName="ranged-tooltip ranged-tooltip-small ranged"
                          title={
                            value?.type === 2 ? (
                              <RangeTooltipContent
                                parent={'pool'}
                                price={Number(
                                  decimalConversion(value?.price)
                                ).toFixed(PRICE_DECIMALS)}
                                max={Number(
                                  decimalConversion(value?.maxPrice)
                                ).toFixed(PRICE_DECIMALS)}
                                min={Number(
                                  decimalConversion(value?.minPrice)
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
                            {Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) >
                              Number(
                                decimalConversion(value?.minPrice)
                              ).toFixed(PRICE_DECIMALS) &&
                            Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) <
                              Number(
                                decimalConversion(value?.maxPrice)
                              ).toFixed(PRICE_DECIMALS) ? (
                              <NextImage src={RangeGreen} alt="Logo" />
                            ) : (
                              <NextImage src={RangeRed} alt="Logo" />
                            )}
                            {Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) >
                              Number(
                                decimalConversion(value?.minPrice)
                              ).toFixed(PRICE_DECIMALS) &&
                            Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) <
                              Number(
                                decimalConversion(value?.maxPrice)
                              ).toFixed(PRICE_DECIMALS) ? (
                              <div className="success-color">{'In Range'}</div>
                            ) : (
                              <div className="warn-color">{'Out of Range'}</div>
                            )}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : value?.type === 1 ? (
                  ''
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) =>
        denomConversion(a?.PoolPair?.balances?.baseCoin?.denom)?.localeCompare(
          denomConversion(b?.PoolPair?.balances?.quoteCoin?.denom)
        ),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'APR',
      dataIndex: 'APR',
      key: 'APR',
      render: (value) => (
        <>
          <div
            className={`${styles.farmCard__element__left__apr} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <Tooltip
              title={
                !getMasterPool(value?.id?.toNumber()) ? (
                  <>
                    <div className="upto_apr_tooltip_farm_main_container">
                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">
                          Total APR (incl. MP Rewards):
                        </span>
                        <span className="value">
                          {' '}
                          {commaSeparator(
                            calculateUptoApr(Number(value?.id), value) || 0
                          )}
                          %
                        </span>
                      </div>

                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">
                          Base APR ({' '}
                          <NextImage
                            src={iconList?.['ucmdx']?.coinImageUrl}
                            alt={'logo'}
                            height={15}
                            width={15}
                          />{' '}
                          CMDX yield only):
                        </span>

                        {calculateExternalBasePoolApr(Number(value?.id))
                          ?.length > 0 ? (
                          calculateExternalBasePoolApr(Number(value?.id)).map(
                            (item, i) => (
                              <span className="value" key={i}>
                                {commaSeparator(fixedDecimal(item?.apr) || 0)}%
                              </span>
                            )
                          )
                        ) : (
                          <span className="value">0%</span>
                        )}
                      </div>

                      {calculateExternalPoolApr(Number(value?.id))?.length >
                        0 && (
                        <div className="upto_apr_tooltip_farm active">
                          <span className="text">External APR:</span>
                          <span className="value">
                            <div className="eApr">
                              {calculateExternalPoolApr(Number(value?.id)).map(
                                (item, i) => (
                                  <div key={i}>
                                    <NextImage
                                      src={
                                        iconList?.[item?.denom]?.coinImageUrl
                                      }
                                      alt={'logo'}
                                      height={15}
                                      width={15}
                                    />
                                    {commaSeparator(
                                      fixedDecimal(item?.apr) || 0
                                    )}
                                    %
                                  </div>
                                )
                              )}
                            </div>
                          </span>
                        </div>
                      )}

                      {calculateAPY(
                        calculatePoolLiquidity(value?.balances),
                        Number(value?.id)
                      ) ? (
                        <div className="upto_apr_tooltip_farm active">
                          <span className="text">Emission APY:</span>

                          <span className="value">
                            {calculateAPY(
                              calculatePoolLiquidity(value?.balances),
                              Number(value?.id)
                            )
                              ? calculateAPY(
                                  calculatePoolLiquidity(value?.balances),
                                  Number(value?.id)
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
                            poolsApr?.[Number(value?.id)]?.swap_fee_rewards?.[0]
                              ?.apr || 0
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
                className={`${styles.farmCard__element__right__details}
                ${
                  (getMasterPool(value?.id?.toNumber()) && noDataButton) ||
                  !getMasterPool(value?.id?.toNumber())
                    ? styles.cursor
                    : ''
                }
                `}
              >
                <div
                  className={`${
                    styles.farmCard__element__right__details__title
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {commaSeparator(calculateApr(Number(value?.id), value) || 0)}%
                  {!getMasterPool(value?.id?.toNumber()) && (
                    <Icon className={'bi bi-arrow-right'} />
                  )}
                </div>

                <div
                  className={`${styles.farmCard__element__wrap__right} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {!getMasterPool(value?.id?.toNumber()) && (
                    <div
                      className={`${styles.farmCard__element__right__pool} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <div
                        className={`${
                          styles.farmCard__element__right__pool__title
                        } ${styles.boost} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        <NextImage src={Current} alt="Logo" />
                        {`Upto ${commaSeparator(
                          calculateUptoApr(Number(value?.id), value) || 0
                        )}%`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </div>
        </>
      ),
      sorter: (a, b) =>
        Number(calculateApr(a?.APR?.id?.toNumber(), a?.APR) || 0) -
        Number(calculateApr(b?.APR?.id?.toNumber(), b?.APR) || 0),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Total Liquidity',
      dataIndex: 'TotalLiquidity',
      key: 'TotalLiquidity',
      render: (value) => (
        <div
          className={`${styles.liquidity__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__right__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            $
            {commaSeparatorWithRounding(
              calculatePoolLiquidity(value?.balances),
              DOLLAR_DECIMALS
            )}
          </div>
          <Button
            type="primary"
            onClick={() => showModal(value)}
            className="btn-filled3"
            size="small"
          >
            Add Liquidity
          </Button>
        </div>
      ),
      sorter: (a, b) =>
        Number(calculatePoolLiquidity(a?.TotalLiquidity?.balances)) -
        Number(calculatePoolLiquidity(b?.TotalLiquidity?.balances)),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
  ];

  const Columns2 = [
    {
      title: 'Pool Pair',
      dataIndex: 'PoolPair',
      key: 'PoolPair',
      render: (value) => (
        <div
          className={`${styles.farmCard__table__data__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__left__title__logo} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__logo__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farmCard__element__left__logo} ${
                  styles.first
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.farmCard__element__left__logo__main} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage
                    src={
                      iconList?.[value?.balances?.baseCoin?.denom]?.coinImageUrl
                    }
                    alt="Logo"
                    width={50}
                    height={50}
                  />
                </div>
              </div>
              <div
                className={`${styles.farmCard__element__left__logo} ${
                  styles.last
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.farmCard__element__left__logo__main} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage
                    src={
                      iconList?.[value?.balances?.quoteCoin?.denom]
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
              className={`${styles.farmCard__element__left__title} ${
                styles.tableActive
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {showPairDenoms(value)}
            </div>
          </div>

          <div
            className={`${styles.farmCard__element__right__wholetab} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {(value?.balances?.quoteCoin?.denom === 'ucmst' ||
              value?.balances?.baseCoin?.denom === 'ucmst') && (
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
                  className={`${styles.farmCard__element__right__emission} ${styles.emission_img}`}
                >
                  <NextImage src={Emission} alt="Emission" />
                </div>
              </Tooltip>
            )}

            <div
              className={`${styles.farmCard__element__right} ${
                styles.tableActive
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__right__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {getMasterPool(value?.id?.toNumber()) ? (
                  <div
                    className={`${styles.farmCard__element__right__pool} ${
                      theme === 'dark' ? styles.dark : styles.light
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

                {(value?.balances?.quoteCoin?.denom === 'ucmst' ||
                  value?.balances?.baseCoin?.denom === 'ucmst') && (
                  <div
                    className={`${styles.farmCard__element__apr__poll__wrap} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <Tooltip
                      title={
                        calculateAPY(
                          calculatePoolLiquidity(value?.balances),
                          Number(value?.id)
                        ) ? (
                          <>
                            {`For every $1 of liquidity, you will receive `}
                            <span className="emission-amount">
                              {calculatePerDollorEmissioAmount(
                                Number(value?.id),
                                calculatePoolLiquidity(value?.balances)
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
                        {value?.id &&
                        calculateVaultEmission(value?.id?.toNumber())
                          ? commaSeparator(
                              formatNumber(
                                calculateVaultEmission(value?.id?.toNumber())
                              )
                            )
                          : Number(0).toFixed(2)}
                      </div>
                    </Tooltip>
                  </div>
                )}

                {value?.type === 2 ? (
                  <div
                    className={`${styles.farmCard__element__right__basic} ${
                      Number(decimalConversion(value?.price)).toFixed(
                        PRICE_DECIMALS
                      ) >
                        Number(decimalConversion(value?.minPrice)).toFixed(
                          PRICE_DECIMALS
                        ) &&
                      Number(decimalConversion(value?.price)).toFixed(
                        PRICE_DECIMALS
                      ) <
                        Number(decimalConversion(value?.maxPrice)).toFixed(
                          PRICE_DECIMALS
                        )
                        ? styles.green
                        : styles.red
                    }`}
                  >
                    <div className="ranged-box">
                      <div className="ranged-box-inner">
                        <Tooltip
                          overlayClassName="ranged-tooltip ranged-tooltip-small ranged"
                          title={
                            value?.type === 2 ? (
                              <RangeTooltipContent
                                parent={'pool'}
                                price={Number(
                                  decimalConversion(value?.price)
                                ).toFixed(PRICE_DECIMALS)}
                                max={Number(
                                  decimalConversion(value?.maxPrice)
                                ).toFixed(PRICE_DECIMALS)}
                                min={Number(
                                  decimalConversion(value?.minPrice)
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
                            {Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) >
                              Number(
                                decimalConversion(value?.minPrice)
                              ).toFixed(PRICE_DECIMALS) &&
                            Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) <
                              Number(
                                decimalConversion(value?.maxPrice)
                              ).toFixed(PRICE_DECIMALS) ? (
                              <NextImage src={RangeGreen} alt="Logo" />
                            ) : (
                              <NextImage src={RangeRed} alt="Logo" />
                            )}
                            {Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) >
                              Number(
                                decimalConversion(value?.minPrice)
                              ).toFixed(PRICE_DECIMALS) &&
                            Number(decimalConversion(value?.price)).toFixed(
                              PRICE_DECIMALS
                            ) <
                              Number(
                                decimalConversion(value?.maxPrice)
                              ).toFixed(PRICE_DECIMALS) ? (
                              <div className="success-color">{'In Range'}</div>
                            ) : (
                              <div className="warn-color">{'Out of Range'}</div>
                            )}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : value?.type === 1 ? (
                  ''
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) =>
        denomConversion(a?.PoolPair?.balances?.baseCoin?.denom)?.localeCompare(
          denomConversion(b?.PoolPair?.balances?.quoteCoin?.denom)?.symbol
        ),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'APR',
      dataIndex: 'APR',
      key: 'APR',
      render: (value) => (
        <>
          <div
            className={`${styles.farmCard__element__left__apr} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <Tooltip
              title={
                <>
                  <div className="upto_apr_tooltip_farm_main_container">
                    <div className="upto_apr_tooltip_farm active">
                      <span className="text">
                        Total APR (incl. MP Rewards):
                      </span>
                      <span className="value">
                        {' '}
                        {commaSeparator(
                          calculateUptoApr(Number(value?.id), value) || 0
                        )}
                        %
                      </span>
                    </div>

                    <div className="upto_apr_tooltip_farm active">
                      <span className="text">
                        Base APR ({' '}
                        <NextImage
                          src={iconList?.['ucmdx']?.coinImageUrl}
                          alt={'logo'}
                          height={15}
                          width={15}
                        />{' '}
                        CMDX yield only):
                      </span>
                      {calculateExternalBasePoolApr(Number(value?.id))?.length >
                      0 ? (
                        calculateExternalBasePoolApr(Number(value?.id)).map(
                          (item, i) => (
                            <span className="value" key={i}>
                              {commaSeparator(fixedDecimal(item?.apr) || 0)}%
                            </span>
                          )
                        )
                      ) : (
                        <span className="value">0%</span>
                      )}
                    </div>

                    {calculateExternalPoolApr(Number(value?.id))?.length >
                      0 && (
                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">External APR:</span>
                        <span className="value">
                          <div className="eApr">
                            {calculateExternalPoolApr(Number(value?.id)).map(
                              (item, i) => (
                                <div key={i}>
                                  <NextImage
                                    src={iconList?.[item?.denom]?.coinImageUrl}
                                    alt={'logo'}
                                    height={15}
                                    width={15}
                                  />
                                  {commaSeparator(fixedDecimal(item?.apr) || 0)}
                                  %
                                </div>
                              )
                            )}
                          </div>
                        </span>
                      </div>
                    )}

                    {calculateAPY(
                      calculatePoolLiquidity(value?.balances),
                      Number(value?.id)
                    ) ? (
                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">Emission APY:</span>

                        <span className="value">
                          {calculateAPY(
                            calculatePoolLiquidity(value?.balances),
                            Number(value?.id)
                          )
                            ? calculateAPY(
                                calculatePoolLiquidity(value?.balances),
                                Number(value?.id)
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
                          poolsApr?.[Number(value?.id)]?.swap_fee_rewards?.[0]
                            ?.apr || 0
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
              }
              overlayClassName="farm_upto_apr_tooltip"
            >
              <div
                className={`${styles.farmCard__element__right__details} 
                ${
                  (getMasterPool(value?.id?.toNumber()) && noDataButton) ||
                  !getMasterPool(value?.id?.toNumber())
                    ? styles.cursor
                    : ''
                }
                `}
              >
                <div
                  className={`${
                    styles.farmCard__element__right__details__title
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {`${commaSeparator(
                    calculateChildPoolApr(Number(value?.id), value) || 0
                  )}%`}
                  {<Icon className={'bi bi-arrow-right'} />}
                </div>
                {
                  <div
                    className={`${styles.farmCard__element__right__pool} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__pool__title
                      } ${styles.boost} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <NextImage src={Current} alt="Logo" />
                      {`Upto ${commaSeparator(
                        calculateUptoApr(Number(value?.id), value) || 0
                      )}%`}
                    </div>
                  </div>
                }
              </div>
            </Tooltip>
          </div>
        </>
      ),
      sorter: (a, b) =>
        Number(calculateApr(a?.APR?.id?.toNumber(), a?.APR) || 0) -
        Number(calculateApr(b?.APR?.id?.toNumber(), b?.APR) || 0),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'My Liquidity',
      dataIndex: 'TotalLiquidity',
      key: 'TotalLiquidity',
      render: (value) => (
        <div
          className={`${styles.liquidity__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__right__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            ${commaSeparator(Number(value || 0).toFixed(DOLLAR_DECIMALS))}
          </div>
        </div>
      ),
      sorter: (a, b) =>
        Number(a?.TotalLiquidity || 0) - Number(b?.TotalLiquidity || 0),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Action',
      dataIndex: 'Action',
      key: 'Action',
      render: (value) => (
        <>
          <Button
            type="primary"
            onClick={() => showModal(value)}
            className="btn-filled2"
            size="small"
          >
            Manage
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    const DATA2 =
      pool &&
      pool?.map((item) => {
        return {
          PoolPair: item,
          APR: item,
          TotalLiquidity: userLiquidityInPools[item?.id],
          Action: item,
        };
      });

    setData2(DATA2);
  }, [pool, refetch, userLiquidityRefetch]);

  useEffect(() => {
    const DATA =
      pool &&
      pool?.map((item) => {
        return {
          PoolPair: item,
          APR: item,
          TotalLiquidity: item,
        };
      });

    setData(DATA);
  }, [pool, refetch, userLiquidityRefetch]);

  const tableClassName = (record) => {
    if (getMasterPool(Number(record?.APR?.id))) {
      return 'master__card'; // Custom CSS class for the highlighted row
    }

    if (record?.APR?.type === 2) {
      if (
        Number(decimalConversion(record?.APR?.price)).toFixed(PRICE_DECIMALS) >
          Number(decimalConversion(record?.APR?.minPrice)).toFixed(
            PRICE_DECIMALS
          ) &&
        Number(decimalConversion(record?.APR?.price)).toFixed(PRICE_DECIMALS) <
          Number(decimalConversion(record?.APR?.maxPrice)).toFixed(
            PRICE_DECIMALS
          )
      ) {
        return '';
      } else {
        return 'dim__card';
      }
    }
    return '';
  };

  return (
    <>
      {noDataButton ? (
        <Table
          className={'custom-table assets-table'}
          dataSource={data2}
          columns={Columns2}
          pagination={false}
          rowClassName={tableClassName}
          locale={{
            emptyText: (
              <NoDataIcon
                text="No Liquidity Provided"
                button={true}
                buttonText={'Go To Pools'}
                OnClick={() => handleClick()}
              />
            ),
          }}
          scroll={{ x: '100%' }}
        />
      ) : (
        <Table
          className={'custom-table assets-table'}
          dataSource={data}
          columns={Columns}
          rowClassName={tableClassName}
          pagination={false}
          locale={{
            emptyText: <NoDataIcon text="No Pools Exist" button={false} />,
          }}
          scroll={{ x: '100%' }}
        />
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
    </>
  );
};

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
    userLiquidityRefetch: state.liquidity.userLiquidityRefetch,
  };
};

const actionsToProps = {
  setUserLiquidityInPools,
  setShowMyPool,
};

export default connect(stateToProps, actionsToProps)(FarmTable);
