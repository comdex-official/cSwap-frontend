import TableNew from "../../shared/components/table/Table";
// import Table from "@/shared/components/table/Table"

import * as PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Icon } from "../../shared/image/Icon";
import { NextImage } from "../../shared/image/NextImage";
import { useState } from "react";
import styles from "./Farm.module.scss";
import {
  ATOM,
  CMDS,
  Cup,
  Current,
  Emission,
  HirborLogo,
  Pyramid,
  Ranged,
} from "../../shared/image";
import dynamic from "next/dynamic";
import { Modal, Tooltip, message, Table, Button } from "antd";
import Liquidity from "./Liquidity";
import Card from "../../shared/components/card/Card";
import {
  setUserLiquidityInPools,
  setShowMyPool,
} from "../../actions/liquidity";
import {
  DOLLAR_DECIMALS,
  PRICE_DECIMALS,
  PRODUCT_ID,
} from "../../constants/common";
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
  emissiondata,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
  userProposalProjectedEmission,
  votingCurrentProposal,
  votingCurrentProposalId,
} from "../../services/liquidity/query";
import RangeTooltipContent from "../../shared/components/range/RangedToolTip";
import PoolCardRow from "../portfolio/MyPoolRow";
import ShowAPR from "../portfolio/ShowAPR";
import NoDataIcon from "../../shared/components/NoDataIcon";

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
}) => {
  const [showMoreData, setshowMoreData] = useState(false);
  const [isPortifolioManageModalOpen, setIsPortifolioManageModalOpen] =
    useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSinglePool, setSelectedSinglePool] = useState();

  const showModal = (_value) => {
    setSelectedSinglePool(_value);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
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
      // showPortofolioManageModal()
      setIsPortifolioManageModalOpen(true);
    }
  }, []);

  // console.log(pool, "pool");
  // console.log(poolsApr, "poolsApr");

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

  const calculateMasterPoolApr = (_id) => {
    const totalMasterPoolApr = poolsApr?.[_id]?.incentive_rewards.filter(
      (reward) => reward.master_pool
    );
    // .reduce((acc, reward) => acc + reward.apr, 0);

    // console.log(totalMasterPoolApr?.[0]?.apr, "totalMasterPoolApr");
    return fixedDecimal(totalMasterPoolApr?.[0]?.apr);
  };

  const calculateChildPoolApr = (_id) => {
    const totalApr = poolsApr?.[_id]?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = poolsApr?.[_id]?.swap_fee_rewards.reduce(
      (acc, reward) => acc + reward.apr,
      0
    );
    const total = totalApr + swapFeeApr;
    return fixedDecimal(total);
  };

  const calculateApr = (_id) => {
    getMasterPool(_id);
    if (getMasterPool(_id)) {
      return calculateMasterPoolApr(_id);
    } else {
      return calculateChildPoolApr(_id);
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

  const calculateUptoApr = (_id) => {
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

    totalMasterPoolApr =
      fixedDecimal(totalMasterPoolApr) + fixedDecimal(totalApr);
    return fixedDecimal(totalMasterPoolApr);
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
        message.error(error);
        console.log(error, "Emission Api error");
        return;
      }
      setUserCurrentProposalData(result?.data);
    });
  };

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
      return Number(calculatedEmission);
    }
  };

  // const [showText, setShowText] = useState(false);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setShowText((prevValue) => !prevValue);
  //   }, 4000); // 10 seconds interval

  //   return () => clearInterval(interval);
  // }, []);

  const COLUMNS = [
    {
      Header: "Pool Pair",
      accessor: "PoolPair",
      Cell: ({ row, value }) => (
        <div
          className={`${styles.farmCard__table__data__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__left__title__logo} ${
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
                      iconList?.[value?.balances?.baseCoin?.denom]?.coinImageUrl
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
                      iconList?.[value?.balances?.quoteCoin?.denom]
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
                styles.tableActive
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {showPairDenoms(value)}
            </div>
          </div>

          <div  className={`${styles.farmCard__element__right__wholetab} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}>
            {(value?.balances?.quoteCoin?.denom === "ucmst" ||
              value?.balances?.baseCoin?.denom === "ucmst") && (
              <Tooltip
                title={"HARBOR emissions enabled"}
                overlayClassName="farm_upto_apr_tooltip"
              >
                <div
                  className={`${styles.farmCard__element__right__emission} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={Emission} alt="Emission" />
                </div>
              </Tooltip>
            )}

            <div
              className={`${styles.farmCard__element__right} ${
                styles.tableActive
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__right__main} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {value?.type === 2 ? (
                  <div
                    className={`${styles.farmCard__element__right__basic} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    <div className="ranged-box">
                      <div className="ranged-box-inner">
                        <Tooltip
                          overlayClassName="ranged-tooltip ranged-tooltip-small ranged"
                          title={
                            value?.type === 2 ? (
                              <RangeTooltipContent
                                parent={"pool"}
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
                              theme === "dark" ? styles.dark : styles.light
                            }`}
                          >
                            <NextImage src={Ranged} />
                            {"Ranged"}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : value?.type === 1 ? (
                  ""
                ) : (
                  // <div
                  //   className={`${styles.farmCard__element__right__basic} ${
                  //     theme === "dark" ? styles.dark : styles.light
                  //   }`}
                  // >
                  //   <div
                  //     className={`${
                  //       styles.farmCard__element__right__basic__title
                  //     } ${theme === "dark" ? styles.dark : styles.light}`}
                  //   >
                  //     {"Basic"}
                  //   </div>
                  // </div>
                  ""
                )}

                <div
                  className={`${styles.farmCard__element__right__pool} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {/* <div
                  className={`${styles.farmCard__element__right__pool__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                > */}
                  {getMasterPool(value?.id?.toNumber()) ? (
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
                      } ${styles.boost} ${
                        theme === "dark" ? styles.dark : styles.light
                      }`}
                    >
                      <NextImage src={Current} alt="Logo" />
                      {"MP Boost"}
                    </div>
                  )}
                </div>
                {/* </div> */}
              </div>
              {checkExternalIncentives(value?.id?.toNumber()) && (
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
        </div>
      ),
    },
    {
      Header: "APR",
      accessor: "APR",
      Cell: ({ value }) => (
        <>
          <div
            className={`${styles.farmCard__element__left__apr} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <Tooltip
              title={
                !getMasterPool(value?.id?.toNumber()) ? (
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
                  {commaSeparator(calculateApr(value?.id?.toNumber()) || 0)}%
                  {!getMasterPool(value?.id?.toNumber()) && (
                    <Icon className={"bi bi-arrow-right"} />
                  )}
                </div>

                <div
                  className={`${styles.farmCard__element__wrap__right} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {!getMasterPool(value?.id?.toNumber()) && (
                    <div
                      className={`${styles.farmCard__element__right__pool} ${
                        theme === "dark" ? styles.dark : styles.light
                      }`}
                    >
                      <div
                        className={`${
                          styles.farmCard__element__right__pool__title
                        } ${styles.boost} ${
                          theme === "dark" ? styles.dark : styles.light
                        }`}
                      >
                        <NextImage src={Current} alt="Logo" />
                        {`Upto ${commaSeparator(
                          calculateUptoApr(value?.id?.toNumber()) || 0
                        )}%`}
                      </div>
                    </div>
                  )}

                  {(value?.balances?.quoteCoin?.denom === "ucmst" ||
                    value?.balances?.baseCoin?.denom === "ucmst") && (
                    <div
                      className={`${
                        styles.farmCard__element__apr__poll__wrap
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <Tooltip
                        title={
                          "Farm in CMST paired pools & receive these additional rewards at the end of this weeks HARBOR emissions."
                        }
                        overlayClassName="farm_upto_apr_tooltip"
                      >
                        <div
                          className={`${
                            styles.farmCard__element__right__apr_pool__title
                          }  ${styles.boost} ${
                            theme === "dark" ? styles.dark : styles.light
                          }`}
                        >
                          <NextImage src={HirborLogo} alt="Logo" />
                          {value?.id &&
                            commaSeparator(
                              calculateVaultEmission(
                                value?.id?.toNumber()
                              ).toFixed(2)
                            )}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      Header: "Total Liquidity",
      accessor: "TotalLiquidity",
      Cell: ({ value }) => (
        <div
          className={`${styles.liquidity__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__right__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {/* ${value} */}$
            {commaSeparatorWithRounding(
              calculatePoolLiquidity(value?.balances),
              DOLLAR_DECIMALS
            )}
          </div>

          <Button
            type="primary"
            onClick={() => showModal(value)}
            className="btn-filled"
            size="small"
          >
            Add Liquidity
          </Button>
          {/* <div
            className={`${styles.farmCard__buttonWrap} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <button onClick={() => showModal(value)}>Add Liquidity</button>
          </div> */}
        </div>
      ),
    },
  ];

  const DATA =
    pool &&
    pool?.map((item) => {
      return {
        PoolPair: item,
        Image1: CMDS,
        Image2: ATOM,
        APR: item,
        TotalLiquidity: item,
      };
    });

  const COLUMNS2 = [
    {
      Header: "Pool Pair",
      accessor: "PoolPair",
      Cell: ({ row, value }) => (
        <div
          className={`${styles.farmCard__table__data__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__left__title__logo} ${
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
                      iconList?.[value?.balances?.baseCoin?.denom]?.coinImageUrl
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
                      iconList?.[value?.balances?.quoteCoin?.denom]
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
                styles.tableActive
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {showPairDenoms(value)}
            </div>
          </div>
        </div>
      ),
    },
    {
      Header: "APR",
      accessor: "APR",
      Cell: ({ value }) => (
        <>
          <div
            className={`${styles.farmCard__element__left__apr} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <Tooltip
              title={
                !getMasterPool(value?.id?.toNumber()) ? (
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
                  {commaSeparator(calculateApr(value?.id?.toNumber()) || 0)}%
                  {!getMasterPool(value?.id?.toNumber()) && (
                    <Icon className={"bi bi-arrow-right"} />
                  )}
                </div>
                {!getMasterPool(value?.id?.toNumber()) && (
                  <div
                    className={`${styles.farmCard__element__right__pool} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__pool__title
                      } ${styles.boost} ${
                        theme === "dark" ? styles.dark : styles.light
                      }`}
                    >
                      <NextImage src={Current} alt="Logo" />
                      {`Upto ${commaSeparator(
                        calculateUptoApr(value?.id?.toNumber()) || 0
                      )}%`}
                    </div>
                  </div>
                )}
              </div>
            </Tooltip>

            {(value?.balances?.quoteCoin?.denom === "ucmst" ||
              value?.balances?.baseCoin?.denom === "ucmst") && (
              <div
                className={`${styles.farmCard__element__apr__poll__wrap} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <Tooltip
                  title={
                    "Farm in CMST paired pools & receive these additional rewards at the end of this weeks HARBOR emissions."
                  }
                  overlayClassName="farm_upto_apr_tooltip"
                >
                  <div
                    className={`${
                      styles.farmCard__element__right__apr_pool__title
                    }  ${styles.boost} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    <NextImage src={HirborLogo} alt="Logo" />
                    {value?.id &&
                      commaSeparator(
                        calculateVaultEmission(value?.id?.toNumber()).toFixed(2)
                      )}
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
        </>
      ),
    },
    {
      Header: "My Liquidity",
      accessor: "TotalLiquidity",
      Cell: ({ value }) => (
        <div
          className={`${styles.liquidity__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__right__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            ${commaSeparator(Number(value || 0).toFixed(DOLLAR_DECIMALS))}
          </div>
        </div>
      ),
    },
    {
      Header: "Action",
      accessor: "Action",
      Cell: ({ value }) => (
        <>
          <Button
            type="primary"
            onClick={() => showModal(value)}
            className="btn-filled"
            size="small"
          >
            Manage
          </Button>
        </>
      ),
    },
  ];

  const DATA2 =
    pool &&
    pool?.map((item) => {
      return {
        PoolPair: item,
        Image1: CMDS,
        Image2: ATOM,
        APR: item,
        TotalLiquidity: userLiquidityInPools[item?.id],
        Action: item,
      };
    });

  return (
    <>
      {noDataButton ? (
        <TableNew
          columns={COLUMNS2}
          data={DATA2}
          noDataButton={noDataButton}
          handleClick={handleClick}
        />
      ) : (
        <TableNew columns={COLUMNS} data={DATA} noDataButton={noDataButton} />
      )}

      <Modal
        className={"modal__wrap2"}
        open={isModalOpen}
        onCancel={handleCancel}
        centered={true}
      >
        <Liquidity theme={theme} pool={selectedSinglePool} />
      </Modal>

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

export default connect(stateToProps, actionsToProps)(FarmTable);
// export default FarmTable
