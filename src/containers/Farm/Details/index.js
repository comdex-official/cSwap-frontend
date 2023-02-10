import { Button, message, Tabs } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import MediaQuery from "react-responsive";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  setFetchBalanceInProgress,
  setPool,
  setPoolBalance,
  setSpotPrice,
  setUserLiquidityInPools
} from "../../../actions/liquidity";
import { Col, Row, SvgIcon } from "../../../components/common";
import TooltipIcon from "../../../components/TooltipIcon";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { queryAllBalances } from "../../../services/bank/query";
import {
  queryPool,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks
} from "../../../services/liquidity/query";
import {
  amountConversion,
  amountConversionWithComma,
  commaSeparatorWithRounding,
  denomConversion,
  getDenomBalance
} from "../../../utils/coin";
import { commaSeparator, marketPrice } from "../../../utils/number";
import { iconNameFromDenom } from "../../../utils/string";
import "../index.scss";
import ShowAPR from "../ShowAPR";
import Deposit from "./Deposit";
import Farm from "./Farm";
import "./index.scss";
import PoolTokenValue from "./PoolTokenValue";
import Unfarm from "./Unfarm";
import Withdraw from "./Withdraw";

const operations = (
  <MediaQuery maxWidth={767}>
    <Link to="/farm">
      <Button type="primary" className="back-btn">
        Back
      </Button>
    </Link>
  </MediaQuery>
);

const FarmDetails = ({
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
  const [providedTokens, setProvidedTokens] = useState();
  const [activeSoftLock, setActiveSoftLock] = useState(0);
  const [queuedSoftLocks, setQueuedSoftLocks] = useState(0);

  const dispatch = useDispatch();
  const { id } = useParams();

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

  useEffect(() => {
    if (address && pool?.id) {
      fetchSoftLock();
    }
  }, [address, pool, refreshBalance, fetchSoftLock]);

  const fetchPool = useCallback(() => {
    queryPool(id, (error, result) => {
      if (error) {
        return;
      }

      setPool(result?.pool);
    });
  }, [id, setPool]);

  useEffect(() => {
    if (id) {
      fetchPool(id);
    }
  }, [id, fetchPool]);

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

  const queryPoolBalance = () => {
    if (pool?.reserveAccountAddress) {
      fetchPoolBalance(pool?.reserveAccountAddress);
    }
    if (id) {
      fetchPool(id);
    }
  };

  const fetchPoolBalance = (address) => {
    setFetchBalanceInProgress(true);
    queryAllBalances(address, (error, result) => {
      setFetchBalanceInProgress(false);

      if (error) {
        return;
      }

      setPoolBalance(result.balances);
      const spotPrice =
        result.balances?.baseCoin?.amount / result.balances?.quoteCoin?.amount;
      setSpotPrice(spotPrice.toFixed(6));
    });
  };

  const handleBalanceRefresh = () => {
    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });
  };

  const showPoolBalance = (list, denom) => {
    let denomBalance =
      list && Object.values(list)?.filter((item) => item.denom === denom)[0];

    return `${amountConversionWithComma(
      denomBalance?.amount || 0,
      assetMap[denomBalance?.denom]?.decimals
    )} ${denomConversion(denom)}`;
  };

  const calculatePoolLiquidity = useCallback(
    (poolBalance) => {
      if (poolBalance && Object.values(poolBalance)?.length) {
        const values = Object.values(poolBalance)?.map(
          (item) =>
            Number(
              amountConversion(item?.amount, assetMap[item?.denom]?.decimals)
            ) * marketPrice(markets, item?.denom)
        );
        return values.reduce((prev, next) => prev + next, 0); // returning sum value
      } else return 0;
    },
    [assetMap, markets]
  );

  const TotalPoolLiquidity = commaSeparatorWithRounding(
    calculatePoolLiquidity(pool?.balances),
    DOLLAR_DECIMALS
  );

  useEffect(() => {
    let totalUserPoolLiquidity = Number(calculatePoolLiquidity(providedTokens));

    if (pool?.id) {
      setUserLiquidityInPools(pool?.id, totalUserPoolLiquidity || 0);
    }
  }, [pool?.id, providedTokens, calculatePoolLiquidity]);

  const tabItems = [
    {
      label: "Deposit",
      key: "1",
      children: (
        <Deposit
          refreshData={queryPoolBalance}
          updateBalance={handleBalanceRefresh}
        />
      ),
    },
    {
      label: "Withdraw",
      key: "2",
      children: (
        <Withdraw
          refreshData={queryPoolBalance}
          updateBalance={handleBalanceRefresh}
        />
      ),
    },
    {
      label: "Farm",
      key: "3",
      children: (
        <Farm
          refreshData={queryPoolBalance}
          updateBalance={handleBalanceRefresh}
          userPoolTokens={userPoolTokens}
        />
      ),
    },
    {
      label: "Unfarm",
      key: "4",
      children: (
        <Unfarm
          refreshData={queryPoolBalance}
          updateBalance={handleBalanceRefresh}
          userLockedPoolTokens={userLockedPoolTokens}
        />
      ),
    },
  ];

  return (
    <Row>
      <Col md="6">
        <Tabs
          className="comdex-tabs farm-modal-tab farm-details-tab"
          tabBarExtraContent={operations}
          items={tabItems}
        />
      </Col>
      <Col md="6">
        <MediaQuery minWidth={767}>
          <div className="text-right mb-4">
            <Link to="/farm">
              <Button className="back-btn">Back</Button>
            </Link>
          </div>
        </MediaQuery>
        <div className="farm-content-card-right">
          <h3 className="mt-2 mb-2">Pool Details #{pool?.id?.toNumber()}</h3>
          <Row>
            <Col sm="6">
              <div className="pool-details-upper">
                <div className="pool-details-icon">
                  <div className="pool-details-icon-inner">
                    <SvgIcon
                      name={iconNameFromDenom(pool?.balances?.baseCoin?.denom)}
                    />
                  </div>
                </div>
                <div className="pool-details-dlt">
                  <h2>50%</h2>
                  <small>
                    {denomConversion(pool?.balances?.baseCoin?.denom)}
                  </small>
                </div>
              </div>
            </Col>
            <Col sm="6">
              <div className="pool-details-upper">
                <div className="pool-details-icon">
                  <div className="pool-details-icon-inner">
                    <SvgIcon
                      name={iconNameFromDenom(pool?.balances?.quoteCoin?.denom)}
                    />
                  </div>
                </div>
                <div className="pool-details-dlt">
                  <h2>50%</h2>
                  <small>
                    {denomConversion(pool?.balances?.quoteCoin?.denom)}
                  </small>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="pool-details-list">
            <Col sm="6" className="mb-3">
              <label>Total Amount</label>
              <p>
                {" "}
                {pool?.balances?.baseCoin?.denom &&
                  showPoolBalance(
                    pool?.balances,
                    pool?.balances?.baseCoin?.denom
                  )}
              </p>
            </Col>
            <Col sm="6" className="mb-3">
              <label>Total Amount</label>
              <p>
                {" "}
                {pool?.balances?.quoteCoin?.denom &&
                  showPoolBalance(
                    pool?.balances,
                    pool?.balances?.quoteCoin?.denom
                  )}
              </p>
            </Col>
            <Col sm="6" className="mb-3">
              <label>
                Pool Liquidity
                <TooltipIcon text="Total Liquidity of the current pool" />
              </label>
              <p>{`$${TotalPoolLiquidity}`}</p>
            </Col>
            <Col sm="6" className="mb-3">
              <label>
                Apr
                <TooltipIcon text="Annual percentage rate of rewards for the corresponding pool. Note:- APRs are subject to change with pool size." />
              </label>
              <div className="farm-apr-modal">
                <ShowAPR pool={pool} />
                <div className="swap-apr mt-1">
                  Swap APR -{" "}
                  {commaSeparator(
                    Number(
                      rewardsMap?.[pool?.id?.toNumber()]?.swap_fee_rewards[0]
                        ?.apr || 0
                    ).toFixed(DOLLAR_DECIMALS)
                  )}
                  %
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="farm-content-card-right mt-4">
          <h3 className="mt-2 mb-2">Your Details</h3>
          <Row className="pool-details-list">
            <Col sm="4" className="mb-3">
              <label>My Amount</label>
              <p>
                {" "}
                {pool?.balances?.baseCoin?.denom &&
                  showPoolBalance(
                    providedTokens,
                    pool?.balances?.baseCoin?.denom
                  )}
              </p>
            </Col>
            <Col sm="4" className="mb-3">
              <label>My Amount</label>
              <p>
                {" "}
                {pool?.balances?.quoteCoin?.denom &&
                  showPoolBalance(
                    providedTokens,
                    pool?.balances?.quoteCoin?.denom
                  )}
              </p>
            </Col>
            <Col sm="4" className="mb-3">
              <label>My liquidity</label>
              <p>
                $
                {commaSeparator(
                  Number(userLiquidityInPools[pool?.id] || 0).toFixed(
                    DOLLAR_DECIMALS
                  )
                )}
              </p>
            </Col>
            <Col sm="4" className="mb-3">
              <label>Available LP Amount</label>
              <p>
                <PoolTokenValue poolTokens={userPoolTokens} />
              </p>
            </Col>
            <Col sm="4" className="mb-3">
              <label>Farmed LP Amount</label>
              <p>
                <PoolTokenValue poolTokens={userLockedPoolTokens} />
              </p>
            </Col>
          </Row>
        </div>
      </Col>
    </Row>
  );
};

FarmDetails.propTypes = {
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
    pool: state.liquidity.pool._,
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

export default connect(stateToProps, actionsToProps)(FarmDetails);
