import "./index.scss";
import * as PropTypes from "prop-types";
import { Row, Col } from "../../components/common";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { queryPoolsList } from "../../services/liquidity/query";
import {
  setPools,
  setFetchBalanceInProgress,
  setPoolBalance,
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
} from "../../actions/liquidity";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from "../../constants/common";
import { queryAllBalances } from "../../services/bank/query";
import { setSpotPrice } from "../../actions/liquidity";
import { useDispatch } from "react-redux";
import CreatePool from "./CreatePool";
import PoolCardFarm from "../../components/PoolCardFarm";

const Farm = ({
  setPools,
  setPoolBalance,
  setFetchBalanceInProgress,
  pools,
  lang,
  setSpotPrice,
  refreshBalance,
  balances,
  userLiquidityInPools,
  masterPoolMap,
}) => {
  const [inProgress, setInProgress] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  }, []);

  const updatePools = () => {
    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  };

  const fetchPools = (offset, limit, countTotal, reverse) => {
    setInProgress(true);
    queryPoolsList(offset, limit, countTotal, reverse, (error, result) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      setPools(result.pools);
    });
  };

  const queryPoolBalance = (pool) => {
    fetchPoolBalance(pool?.reserveAccountAddress);
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

  const userPools = pools.filter((pool) => {
    return balances.find((balance) => {
      return balance.denom === pool.poolCoinDenom;
    });
  });

  return (
    <div className="app-content-wrapper">
      {inProgress ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <>
          <div className="create-pool-main-container text-right mb-n3">
            <CreatePool
              refreshData={updatePools}
              refreshBalance={handleBalanceRefresh}
            />
          </div>

          {userPools && userPools.length > 0 ? (
            <div className="pools-bottom-section mb-5">
              <div className="farm-heading">My Pools</div>
              <Row>
                <Col sm="12">
                  <div className="pool-card-section">
                    {!inProgress && userPools && userPools.length > 0 ? (
                      userPools.map((item, index) => (
                        <PoolCardFarm
                          parent={"user"}
                          key={item.id}
                          pool={item}
                          poolIndex={index}
                          lang={lang}
                          userLiquidity={userLiquidityInPools[item?.id]}
                        />
                      ))
                    ) : (
                      <div className="ml-3">
                        {!inProgress ? "Empty pool" : ""}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          ) : null}
          <div className="pools-upper-section">
            <div className="farm-heading">Master Pools</div>
            <Row>
              <Col>
                <div className="pool-card-section">
                  {!inProgress && pools && pools.length > 0
                    ? pools.map((item, index) => {
                        if (masterPoolMap?.[item?.id]?.poolId) {
                          return (
                            <PoolCardFarm
                              key={item.id}
                              pool={item}
                              poolIndex={index}
                              lang={lang}
                              userLiquidity={userLiquidityInPools[item?.id]}
                            />
                          );
                        }
                      })
                    : null}
                </div>
              </Col>
            </Row>
          </div>
          <div className="pools-upper-section mt-5">
            <div className="farm-heading">Child Pools</div>
            <Row>
              <Col>
                <div className="pool-card-section">
                  {!inProgress && pools && pools.length > 0
                    ? pools.map((item, index) => {
                        if (!masterPoolMap?.[item?.id]?.poolId) {
                          return (
                            <PoolCardFarm
                              key={item.id}
                              pool={item}
                              poolIndex={index}
                              lang={lang}
                              userLiquidity={userLiquidityInPools[item?.id]}
                            />
                          );
                        }
                      })
                    : null}
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

Farm.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  setFetchBalanceInProgress: PropTypes.func.isRequired,
  setFirstReserveCoinDenom: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setPools: PropTypes.func.isRequired,
  setSpotPrice: PropTypes.func.isRequired,
  setSecondReserveCoinDenom: PropTypes.func.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  masterPoolMap: PropTypes.object,
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
  inProgress: PropTypes.bool,
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    inProgress: state.liquidity.inProgress,
    pools: state.liquidity.pool.list,
    refreshBalance: state.account.refreshBalance,
    balances: state.account.balances.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    masterPoolMap: state.liquidity.masterPoolMap,
  };
};

const actionsToProps = {
  setPools,
  setPoolBalance,
  setFetchBalanceInProgress,
  setSecondReserveCoinDenom,
  setFirstReserveCoinDenom,
  setSpotPrice,
};

export default connect(stateToProps, actionsToProps)(Farm);
