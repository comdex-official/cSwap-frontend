import { Icon } from "../../shared/image/Icon";
import { FarmCustomData } from "./Data";
import styles from "./Farm.module.scss";
import Tab from "../../shared/components/tab/Tab";
import Search from "../../shared/components/search/Search";
import FarmTable from "./FarmTable";
import FarmCard from "./FarmCard";
import { Input, message, Spin, Tabs, Tooltip } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setPools, setShowEligibleDisclaimer } from "../../actions/liquidity";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  MASTER_POOL_ID,
} from "../../constants/common";
import { fetchRestAPRs, queryPoolsList } from "../../services/liquidity/query";
import { denomConversion, fixedDecimal } from "../../utils/coin";
import MyDropdown from "../../shared/components/dropDown/Dropdown";
import { NextImage } from "../../shared/image/NextImage";
import { List, ListWhite, Square, SquareWhite } from "../../shared/image";

const MasterPoolsContent = [
  <div key={"1"}>
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
  const theme = "dark";
  const TabData = ["All", "Basic", "Ranged", "My Pools"];

  const [active, setActive] = useState("All");
  const [listView, setListView] = useState(false);
  const [masterPoolData, setMasterPoolData] = useState(0);
  const [userPools, setUserPool] = useState();

  const handleActive = (item) => {
    setActive(item);
  };

  const [inProgress, setInProgress] = useState(false);
  const [displayPools, setDisplayPools] = useState([]);
  const [filterValue, setFilterValue] = useState("3");
  const [poolsApr, setPoolsApr] = useState();

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

  useEffect(() => {
    const rawUserPools = Object.keys(userLiquidityInPools)?.map((poolKey) =>
      displayPools?.find(
        (pool) =>
          pool?.id?.toNumber() === Number(poolKey) &&
          Number(userLiquidityInPools[poolKey]) > 0
      )
    );
    const userPools = rawUserPools?.filter((item) => item); // removes undefined values from array
    // setUserPool(rawUserPools?.filter((item) => item)); // removes undefined values from array
    setUserPool(userPools);
  }, [userLiquidityInPools]);

  const updateFilteredData = useCallback(
    (filterValue, userPools) => {
      if (filterValue !== "3") {
        if (filterValue === "4") {
          setDisplayPools(userPools);
        } else {
          let filteredPools = pools.filter(
            (item) => item.type === Number(filterValue)
          );
          setDisplayPools(filteredPools);
        }
      } else {
        setDisplayPools(pools);
      }
    },
    [pools]
  );

  const getAPRs = () => {
    fetchRestAPRs((error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      setPoolsApr(result?.data);
    });
  };

  useEffect(() => {
    getAPRs();
  }, []);

  useEffect(() => {
    updateFilteredData(filterValue, userPools);
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

  const fetchMasterPoolAprData = () => {
    // Fetching master pool key
    if (pools) {
      Object.keys(poolsApr && poolsApr).forEach((value) => {
        const incentiveRewards = poolsApr?.[value]?.incentive_rewards;

        incentiveRewards.forEach((incentive) => {
          if (incentive.master_pool === true) {
            let masterPoolData = pools?.filter(
              (item) => Number(item?.id?.toNumber()) === Number(value)
            );
            setMasterPoolData(masterPoolData?.[0]);
          }
        });
      });
    }
  };

  useEffect(() => {
    if (poolsApr) {
      fetchMasterPoolAprData();
    }
  }, [poolsApr]);

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

  const Items = [
    {
      key: "item-2",
      label: (
        <div className={styles.dropdown__farm}>
          <p>{"APR"}</p>
          <p>{"My Pools"}</p>
          <p>{"Date Created"}</p>
          <p>{"Pool Liquidity"}</p>
        </div>
      ),
    },
  ];

  return (
    <div
      className={`${styles.farm__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.farm__main} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.farm__header} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farm__header__body__left} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farm__header__left__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"cSwap v2 Live"}
            </div>
            <div
              className={`${styles.farm__header__left__description} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"Supercharge Your LP Earnings with boosted rewards on cSwap."}
            </div>
            <div
              className={`${styles.farm__header__left__more} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"learn more"}
            </div>
          </div>
          <div
            className={`${styles.farm__header__body__right} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farm__header__right__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"How it works?"}
            </div>
            <div
              className={`${styles.farm__header__right__main} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farm__header__right__body} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farm__header__right__body__background} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.farm__header__right__body__title} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {"STEP 1"}
                  </div>
                  <div
                    className={`${
                      styles.farm__header__right__body__description
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"Provide liquidity in the Master pool"}
                  </div>
                  <div
                    className={`${styles.farm__header__right__body__button} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {"Go to Pool"}
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farm__header__right__body} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farm__header__right__body__background} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.farm__header__right__body__title} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {"STEP 2"}
                  </div>
                  <div
                    className={`${
                      styles.farm__header__right__body__description
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {`Deposit Equal value of assets in Child Pool 
                    or pools as your Master Pool to 
                    earn boosted rewards`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${styles.farm__body} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farm__body__left} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farm__body__tab__wrap} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {/* <Tab data={TabData} active={active} handleActive={handleActive} /> */}
              <div className="">
                <Tabs
                  defaultActiveKey="1"
                  items={tabItems}
                  activeKey={filterValue}
                  onChange={onChange}
                  className="comdex-tabs farm-details-tabmain"
                  // tabBarExtraContent={
                  //   <div className="farmtab-right-action">
                  //     <CreatePool
                  //       refreshData={updatePools}
                  //       refreshBalance={handleBalanceRefresh}
                  //     />
                  //     <Input
                  //       placeholder="Search Pools.."
                  //       onChange={(event) => onSearchChange(event.target.value)}
                  //     suffix={<SvgIcon name="search" viewbox="0 0 18 18" />}
                  //     />
                  //   </div>
                  // }
                />
              </div>
            </div>
            <div
              className={`${styles.farm__body__line} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            />
            <div
              className={`${styles.farm__body__icon__wrap} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {!listView ? (
                <>
                  <NextImage
                    src={SquareWhite}
                    onClick={() => setListView(false)}
                    height={15}
                    width={15}
                  />
                  <NextImage
                    src={List}
                    onClick={() => setListView(true)}
                    height={15}
                    width={15}
                  />
                </>
              ) : (
                <>
                  <NextImage
                    src={Square}
                    onClick={() => setListView(false)}
                    height={15}
                    width={15}
                  />
                  <NextImage
                    src={ListWhite}
                    onClick={() => setListView(true)}
                    height={15}
                    width={15}
                  />
                </>
              )}
            </div>
          </div>
          <div
            className={`${styles.farm__body__right} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <MyDropdown
              items={Items}
              placement={"bottomRight"}
              trigger={["click"]}
            >
              <div
                className={`${styles.farm__body__filter__wrap} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <Icon className={"bi bi-funnel-fill"} />
                {"Filter"}
              </div>
            </MyDropdown>
            <div
              className={`${styles.farm__body__search__wrap} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <Input
                placeholder="Search Pools.."
                onChange={(event) => onSearchChange(event.target.value)}
                className="asset_search_input"
              />
            </div>
          </div>
        </div>
        <div
          className={`${styles.farm__footer} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          {listView ? (
            <div
              className={`${styles.farm__table__wrap} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {/* {displayPools && displayPools.map((item) => ( */}
              <FarmTable
                theme={theme}
                pool={displayPools}
                poolsApr={poolsApr}
                poolAprList={poolsApr && poolsApr}
              />
              {/* ))} */}
            </div>
          ) : (
            <div
              className={`${styles.farm__footer__card__wrap} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {displayPools &&
                displayPools.map((item) => (
                  <FarmCard
                    key={item.id}
                    theme={theme}
                    pool={item}
                    poolsApr={poolsApr?.[item?.id?.toNumber()]}
                    poolAprList={poolsApr && poolsApr}
                    masterPoolData={masterPoolData}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
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
