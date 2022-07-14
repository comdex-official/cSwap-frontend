import React, { useEffect, useState } from "react";
import { Col, Row, SvgIcon } from "../../../components/common";
import { Button, message, Tabs } from "antd";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import Farm from "./Farm";
import Unfarm from "./Unfarm";
import "./index.scss";
import TooltipIcon from "../../../components/TooltipIcon";
import MediaQuery from "react-responsive";
import * as PropTypes from "prop-types";
import {
  setFetchBalanceInProgress,
  setPool,
  setPoolBalance,
  setSpotPrice,
} from "../../../actions/liquidity";
import { connect, useDispatch } from "react-redux";
import { queryAllBalances } from "../../../services/bank/query";
import { useParams } from "react-router";
import {
  queryLiquidityPair,
  queryPool,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
} from "../../../services/liquidity/query";
import { setPair } from "../../../actions/asset";
import { iconNameFromDenom } from "../../../utils/string";
import {
  amountConversionWithComma,
  denomConversion,
  getDenomBalance,
} from "../../../utils/coin";
import { marketPrice } from "../../../utils/number";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { Link } from "react-router-dom";
import PoolTokenValue from "./PoolTokenValue";
import ShowAPR from "../ShowAPR";

const { TabPane } = Tabs;

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
  pair,
  setPair,
  markets,
  balances,
    poolPriceMap,
}) => {
  const [providedTokens, setProvidedTokens] = useState();
  const [activeSoftLock, setActiveSoftLock] = useState(0);
  const [queuedSoftLocks, setQueuedSoftLocks] = useState(0);

  const dispatch = useDispatch();
  const { id } = useParams();
  const userPoolTokens = getDenomBalance(balances, pool?.poolCoinDenom) || 0;

  const queuedAmounts =
    queuedSoftLocks &&
    queuedSoftLocks.length > 0 &&
    queuedSoftLocks?.map((item) => item?.poolCoin?.amount);
  const userLockedPoolTokens =
    Number(
      queuedAmounts?.length > 0 &&
        queuedAmounts?.reduce((a, b) => Number(a) + Number(b), 0)
    ) + Number(activeSoftLock?.amount) || 0;

  useEffect(() => {
    if (address && pool?.id) {
      fetchSoftLock();
    }
  }, [address, pool, refreshBalance]);

  const fetchSoftLock = () => {
    queryPoolSoftLocks(address, pool?.id, (error, result) => {
      if (error) {
        return;
      }

      setActiveSoftLock(result?.activePoolCoin);
      setQueuedSoftLocks(result?.queuedPoolCoin);
    });
  };

  useEffect(() => {
    if (id) {
      fetchPool(id);
    }

    setPair({});
  }, []);

  const fetchPool = () => {
    queryPool(id, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setPool(result?.pool);
    });
  };

  useEffect(() => {
    if (pool?.pairId) {
      queryLiquidityPair(pool?.pairId, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setPair(result.pair);
      });
    }
  }, [pool]);

  useEffect(() => {
    if (pool?.id && userPoolTokens) {
      fetchProvidedCoins();
    }
  }, [pool, userPoolTokens, userLockedPoolTokens]);

  const fetchProvidedCoins = () => {
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
  };

  const queryPoolBalance = () => {
    fetchPoolBalance(pool?.reserveAccountAddress);
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
        (result.balances && result.balances[0] && result.balances[0].amount) /
        (result.balances && result.balances[1] && result.balances[1].amount);
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
    let denomBalance = list?.filter((item) => item.denom === denom)[0];

    return `${amountConversionWithComma(
      denomBalance?.amount || 0
    )} ${denomConversion(denom)}`;
  };

  const calculatePoolLiquidity = (poolBalance) => {
    if (poolBalance && poolBalance.length > 0) {
      const values = poolBalance.map(
        (item) => Number(item?.amount) * (poolPriceMap[item?.denom] || marketPrice(markets, item?.denom))
      );
      return values.reduce((prev, next) => prev + next, 0); // returning sum value
    } else return 0;
  };

  const TotalPoolLiquidity = amountConversionWithComma(
    calculatePoolLiquidity(pool?.balances),
    DOLLAR_DECIMALS
  );

  const TotalUserPoolLiquidity = amountConversionWithComma(
    calculatePoolLiquidity(providedTokens),
    DOLLAR_DECIMALS
  );

  return (
    <Row>
      <Col md="6">
        <Tabs
          className="comdex-tabs farm-modal-tab"
          tabBarExtraContent={operations}
        >
          <TabPane tab="Deposit" key="1">
            <Deposit
              refreshData={queryPoolBalance}
              updateBalance={handleBalanceRefresh}
            />
          </TabPane>
          <TabPane tab="Withdraw" key="2">
            <Withdraw
              refreshData={queryPoolBalance}
              updateBalance={handleBalanceRefresh}
            />
          </TabPane>
          <TabPane tab="Farm" key="3">
            <Farm
              refreshData={queryPoolBalance}
              updateBalance={handleBalanceRefresh}
            />
          </TabPane>
          <TabPane tab="Unfarm" key="4">
            <Unfarm
              refreshData={queryPoolBalance}
              updateBalance={handleBalanceRefresh}
            />
          </TabPane>
        </Tabs>
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
          <h3 className="mt-2 mb-2">Pool Details</h3>
          <Row>
            <Col sm="6">
              <div className="pool-details-upper">
                <div className="pool-details-icon">
                  <div className="pool-details-icon-inner">
                    <SvgIcon name={iconNameFromDenom(pair?.baseCoinDenom)} />
                  </div>
                </div>
                <div className="pool-details-dlt">
                  <h2>50%</h2>
                  <small>{denomConversion(pair?.baseCoinDenom)}</small>
                </div>
              </div>
            </Col>
            <Col sm="6">
              <div className="pool-details-upper">
                <div className="pool-details-icon">
                  <div className="pool-details-icon-inner">
                    <SvgIcon name={iconNameFromDenom(pair?.quoteCoinDenom)} />
                  </div>
                </div>
                <div className="pool-details-dlt">
                  <h2>50%</h2>
                  <small>{denomConversion(pair?.quoteCoinDenom)}</small>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="pool-details-list">
            <Col sm="6" className="mb-3">
              <label>Total amount</label>
              <p>
                {" "}
                {pair?.baseCoinDenom &&
                  showPoolBalance(pool?.balances, pair?.baseCoinDenom)}
              </p>
            </Col>
            <Col sm="6" className="mb-3">
              <label>Total Amount</label>
              <p>
                {" "}
                {pair?.quoteCoinDenom &&
                  showPoolBalance(pool?.balances, pair?.quoteCoinDenom)}
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
                <TooltipIcon text="Annual percentage rate of CMDX rewards for the corresponding  pool. Note:- APRs are subject to change with pool size." />
              </label>
              <p>
                <ShowAPR pool={pool} />
              </p>
            </Col>
          </Row>
        </div>
        <div className="farm-content-card-right mt-4">
          <h3 className="mt-2 mb-2">Your Details</h3>
          <Row className="pool-details-list">
            <Col sm="4" className="mb-3">
              <label>
                My Amount
                <TooltipIcon text="Total Liquidity of the current pool" />
              </label>
              <p>
                {" "}
                {pair?.baseCoinDenom &&
                  showPoolBalance(providedTokens, pair?.baseCoinDenom)}
              </p>
            </Col>
            <Col sm="4" className="mb-3">
              <label>My Amount</label>
              <p>
                {" "}
                {pair?.quoteCoinDenom &&
                  showPoolBalance(providedTokens, pair?.quoteCoinDenom)}
              </p>
            </Col>
            <Col sm="4" className="mb-3">
              <label>My liquidity</label>
              <p>{`$${TotalUserPoolLiquidity}`}</p>
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
  setPair: PropTypes.func.isRequired,
  setPool: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setSpotPrice: PropTypes.func.isRequired,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  inProgress: PropTypes.bool,
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      symbol: PropTypes.string,
      script_id: PropTypes.string,
    })
  ),
  pair: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    baseCoinDenom: PropTypes.string,
    quoteCoinDenom: PropTypes.string,
  }),
  poolPriceMap: PropTypes.object,
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
    pair: state.asset.pair,
    markets: state.oracle.market.list,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

const actionsToProps = {
  setPool,
  setPoolBalance,
  setFetchBalanceInProgress,
  setSpotPrice,
  setPair,
};

export default connect(stateToProps, actionsToProps)(FarmDetails);
