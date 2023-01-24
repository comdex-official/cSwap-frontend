import { Input, message, Spin, Tabs } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setPools } from "../../actions/liquidity";
import { Col, Row, SvgIcon } from "../../components/common";
import PoolCardFarm from "../../components/PoolCardFarm";
import Timer from "../../components/Timer";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  MASTER_POOL_ID
} from "../../constants/common";
import { queryPoolsList } from "../../services/liquidity/query";
import { denomConversion } from "../../utils/coin";
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
  const [displayPools, setDisplayPools] = useState([]);
  const [filterValue, setFilterValue] = useState("3");
  const dispatch = useDispatch();
  const [eligibleDisclaimer, seteligibleDisclaimer] = useState(true)

  const closeDisclaimer = () => {
    seteligibleDisclaimer(false);
  }

  const updateFilteredData = useCallback(
    (filterValue) => {
      if (filterValue !== "3") {
        let filteredPools = pools.filter(
          (item) => item.type === Number(filterValue)
        );
        setDisplayPools(filteredPools);
      } else {
        setDisplayPools(pools);
      }
    },
    [pools]
  );

  useEffect(() => {
    updateFilteredData(filterValue);
  }, [pools, filterValue, updateFilteredData]);

  const onChange = (key) => {
    setFilterValue(key);
  };

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
    displayPools?.find(
      (pool) =>
        pool?.id?.toNumber() === Number(poolKey) &&
        Number(userLiquidityInPools[poolKey]) > 0
    )
  );

  const userPools = rawUserPools.filter((item) => item); // removes undefined values from array

  const tabItems = [
    {
      key: "3",
      label: "All",
    },
    {
      key: "1",
      label: "Basic",
    },
    {
      key: "2",
      label: "Ranged",
    },
  ];

  const onSearchChange = (searchKey) => {
    const searchTerm = searchKey.trim().toLowerCase();
    if (searchTerm) {
      let resultsObj = displayPools.filter((pool) => {
        return (
          denomConversion(pool?.balances?.baseCoin?.denom)
            .toLowerCase()
            .match(new RegExp(searchTerm, "g")) ||
          denomConversion(pool?.balances?.quoteCoin?.denom)
            .toLowerCase()
            .match(new RegExp(searchTerm, "g")) ||
          String(pool.id?.toNumber()).match(new RegExp(searchTerm, "g"))
        );
      });

      setDisplayPools(resultsObj);
    } else {
      updateFilteredData(filterValue);
    }
  };

  return (
    <div className="app-content-wrapper">
      {inProgress && !pools?.length ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <>
          {eligibleDisclaimer &&
            <div className="farm-disclaimer-info">
              <SvgIcon name="error-icon" viewbox="0 0 24.036 21.784" />
              Users need to farm for 24 hours in order to be eligible for rewards
              <SvgIcon className='close-icon' onClick={closeDisclaimer} name='close' viewbox='0 0 19 19' />
            </div>
          }
          <div className="farm-heading farm-headingtimer mb-4 pb-2">
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

          <div className="mb-4">
            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              activeKey={filterValue}
              onChange={onChange}
              className="comdex-tabs"
              tabBarExtraContent={
                <div className="farmtab-right-action">
                  <CreatePool
                    refreshData={updatePools}
                    refreshBalance={handleBalanceRefresh}
                  />
                  <Input
                    placeholder="Search Pools.."
                    onChange={(event) => onSearchChange(event.target.value)}
                    suffix={<SvgIcon name="search" viewbox="0 0 18 18" />}
                  />
                </div>
              }
            />
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
          {Number(filterValue) === 2 ? null : (
            <div className="pools-upper-section mb-5">
              <div className="farm-heading">Master Pools</div>
              <Row>
                <Col>
                  <div className="pool-card-section">
                    {displayPools?.length
                      ? displayPools
                          .filter((item) => masterPoolMap?.[item?.id]?.poolId)
                          .map((item, index) => (
                            <PoolCardFarm
                              key={item?.id}
                              pool={item}
                              poolIndex={index}
                              lang={lang}
                            />
                          ))
                      : "No pools found"}
                  </div>
                </Col>
              </Row>
            </div>
          )}
          <div className="pools-upper-section">
            <div className="farm-heading">Child Pools</div>
            <Row>
              <Col>
                <div className="pool-card-section">
                  {displayPools?.length
                    ? displayPools
                        .filter((item) => !masterPoolMap?.[item?.id]?.poolId)
                        .map((item, index) => (
                          <PoolCardFarm
                            key={item?.id}
                            pool={item}
                            poolIndex={index}
                            lang={lang}
                          />
                        ))
                    : "No pools found"}
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
