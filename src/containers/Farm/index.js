import { Button, Input, message, Select, Spin, Tabs, Tooltip } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setPools, setShowEligibleDisclaimer } from "../../actions/liquidity";
import { Col, Row, SvgIcon } from "../../components/common";
import PoolCardFarm from "../../components/PoolCardFarm";
import Timer from "../../components/Timer";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  MASTER_POOL_ID,
} from "../../constants/common";
import { queryPoolsList } from "../../services/liquidity/query";
import { denomConversion } from "../../utils/coin";
import CreatePool from "./CreatePool";
import "./index.scss";
import { Link } from "react-router-dom";

import cardBg from '../../assets/images/card-bg.jpg'

const MasterPoolsContent = [
  <div>
    Providing liquidity only in Master pool makes you eligible for the External
    APR on Master pool. To be eligible to Earn ‘Master pool’ APR an equal amount
    of liquidity has to be provided in any of the child pools. Read more about
    the mechanism{" "}
    <a
      aria-label="here"
      target="_blank"
      rel="noreferrer"
      href="https://docs.cswap.one/farming-rewards"
    >
      {" "}
      here{" "}
    </a>
  </div>,
];

const Farm = ({
  setPools,
  pools,
  lang,
  refreshBalance,
  masterPoolMap,
  userLiquidityInPools,
  incentivesMap,
  setShowEligibleDisclaimer,
  showEligibleDisclaimer,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [displayPools, setDisplayPools] = useState([]);
  const [filterValue, setFilterValue] = useState("3");
  const dispatch = useDispatch();

  const closeDisclaimer = () => {
    setShowEligibleDisclaimer(false);
  };

  const [isSetOnScroll, setOnScroll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setOnScroll(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
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
      key: "1",
      label: "All",
    },
    {
      key: "2",
      label: "Basic",
    },
    {
      key: "3",
      label: "Ranged",
    },
    {
      key: "4",
      label: "My Pools",
    },
  ];

  const onSearchChange = (searchKey) => {
    const searchTerm = searchKey.trim().toLowerCase();
    if (searchTerm) {
      let resultsObj = displayPools.filter((pool) => {
        return (
          denomConversion(pool?.balances?.baseCoin?.denom)
            ?.toLowerCase()
            .match(new RegExp(searchTerm, "g")) ||
          denomConversion(pool?.balances?.quoteCoin?.denom)
            ?.toLowerCase()
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
          <div className="farmupper-row">
            <Row>
              <Col md='6'>
                <div className="farm-upper-card" style={{ backgroundImage: `url(${cardBg})`}}>
                  <div className="upper-card-inner">
                    <h1>cSwap v2 Live</h1>
                    <p>
                      <div>Supercharge Your LP Earnings with boosted rewards on cSwap.</div>
                      <Link to='/'>learn more</Link>
                    </p>
                  </div>
                </div>
              </Col>
              <Col md='6'>
                <div className="farm-upper-card farm-upper-card2" style={{ backgroundImage: `url(${cardBg})`}}>
                  <div className="upper-card-inner">
                    <h2>How it works?</h2>
                    <div className="inner-card-row">
                      <div className="inner-card">
                        <h2>STEP 1</h2>
                        <p>Provide liquidity in the Master pool</p>
                        <Button className="mt-2" type="primary">Go to Pool</Button>
                      </div>
                      <div className="inner-card">
                        <h2>STEP 2</h2>
                        <p>Deposit Equal value of assets in Child Pool or pools as your Master Pool to earn boosted rewards</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div className="mb-4">
            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              activeKey={filterValue}
              onChange={onChange}
              className="comdex-tabs farm-details-tabmain"
              tabBarExtraContent={
                <>
                  <div>&nbsp;</div>
                  <div className="farmtab-right-action">
                    <Select
                      defaultValue="apr"
                      suffixIcon={<SvgIcon name='filter' viewbox='0 0 13.579 13.385' />}
                      options={[
                        { value: 'apr', label: 'APR' },
                        { value: 'mypools', label: 'My Pools' },
                        { value: 'datecreated', label: 'Date Created' },
                        { value: 'poolliquidity', label: 'Pool Liquidity' },
                      ]}
                    />
                    <Input
                      placeholder="Search Pools.."
                      onChange={(event) => onSearchChange(event.target.value)}
                      suffix={<SvgIcon name="search" viewbox="0 0 18 18" />}
                    />
                  </div>
                </>
              }
            />
          </div>

          {userPools?.length > 0 ? (
            <div className="pools-bottom-section mb-5">
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
        </>
      )}
    </div>
  );
};

Farm.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  setPools: PropTypes.func.isRequired,
  setShowEligibleDisclaimer: PropTypes.func.isRequired,
  showEligibleDisclaimer: PropTypes.bool.isRequired,
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
    showEligibleDisclaimer: state.liquidity.showEligibleDisclaimer,
  };
};

const actionsToProps = {
  setPools,
  setShowEligibleDisclaimer,
};

export default connect(stateToProps, actionsToProps)(Farm);
