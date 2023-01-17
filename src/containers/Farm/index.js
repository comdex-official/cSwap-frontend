import { message, Spin } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setPools } from "../../actions/liquidity";
import { Col, Row } from "../../components/common";
import PoolCardFarm from "../../components/PoolCardFarm";
import Timer from "../../components/Timer";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  MASTER_POOL_ID
} from "../../constants/common";
import { queryPoolsList } from "../../services/liquidity/query";
import CreatePool from "./CreatePool";
import "./index.scss";

const Farm = ({
  setPools,
  pools,
  lang,
  refreshBalance,
  masterPoolMap,
  userLiquidityInPools,
  incentivesMap,
}) => {
  const [inProgress, setInProgress] = useState(false);

  const dispatch = useDispatch();

  const fetchPools = useCallback(
    (offset, limit, countTotal, reverse) => {
      setInProgress(true);
      queryPoolsList(offset, limit, countTotal, reverse, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }

        setPools(result.pools);
      });
    },
    [setPools]
  );

  useEffect(() => {
    if (!pools?.length) {
      fetchPools(
        (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
        DEFAULT_PAGE_SIZE,
        true,
        false
      );
    }
  }, [fetchPools, pools?.length]);

  const updatePools = () => {
    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  };

  const handleBalanceRefresh = () => {
    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });
  };

  const rawUserPools = Object.keys(userLiquidityInPools)?.map((poolKey) =>
    pools?.find(
      (pool) =>
        pool?.id?.toNumber() === Number(poolKey) &&
        Number(userLiquidityInPools[poolKey]) > 0
    )
  );

  const userPools = rawUserPools.filter((item) => item); // removes undefined values from array

  return (
    <div className="app-content-wrapper">
      {inProgress && !pools?.length ? (
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

          <div className="farm-heading farm-headingtimer mb-5">
            <p>
              {" "}
              {incentivesMap?.[MASTER_POOL_ID]?.nextDistribution ? (
                <Timer
                  text={"Reward distribution in "}
                  expiryTimestamp={
                    incentivesMap?.[MASTER_POOL_ID]?.nextDistribution
                  }
                />
              ) : null}
            </p>
          </div>

          {userPools?.length > 0 ? (
            <div className="pools-bottom-section mb-5">
              <div className="farm-heading">My Pools</div>
              <Row>
                <Col sm="12">
                  <div className="pool-card-section">
                    {userPools?.length > 0 ? (
                      userPools.map((item, index) => (
                        <PoolCardFarm
                          parent={"user"}
                          key={item?.id}
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
                  {pools?.length
                    ? pools
                        .filter((item) => masterPoolMap?.[item?.id]?.poolId)
                        .map((item, index) => (
                          <PoolCardFarm
                            key={item?.id}
                            pool={item}
                            poolIndex={index}
                            lang={lang}
                          />
                        ))
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
                  {pools?.length
                    ? pools
                        .filter((item) => !masterPoolMap?.[item?.id]?.poolId)
                        .map((item, index) => (
                          <PoolCardFarm
                            key={item?.id}
                            pool={item}
                            poolIndex={index}
                            lang={lang}
                          />
                        ))
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
  incentivesMap: PropTypes.object,
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
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    pools: state.liquidity.pool.list,
    refreshBalance: state.account.refreshBalance,
    masterPoolMap: state.liquidity.masterPoolMap,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    incentivesMap: state.liquidity.incentivesMap,
  };
};

const actionsToProps = {
  setPools,
};

export default connect(stateToProps, actionsToProps)(Farm);
