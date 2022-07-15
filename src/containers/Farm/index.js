import "./index.scss";
import * as PropTypes from "prop-types";
import { Row, Col } from "../../components/common";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { queryPoolsList } from "../../services/liquidity/query";
import { setPools } from "../../actions/liquidity";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from "../../constants/common";
import { useDispatch } from "react-redux";
import CreatePool from "./CreatePool";
import PoolCardFarm from "../../components/PoolCardFarm";

const Farm = ({
  setPools,
  pools,
  lang,
  refreshBalance,
  balances,
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
  setPools: PropTypes.func.isRequired,
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
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    pools: state.liquidity.pool.list,
    refreshBalance: state.account.refreshBalance,
    balances: state.account.balances.list,
    masterPoolMap: state.liquidity.masterPoolMap,
  };
};

const actionsToProps = {
  setPools,
};

export default connect(stateToProps, actionsToProps)(Farm);
