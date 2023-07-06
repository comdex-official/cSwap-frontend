import { Icon } from '../../shared/image/Icon';
import { FarmCustomData } from './Data';
import styles from './Farm.module.scss';
import Tab from '../../shared/components/tab/Tab';
import Search from '../../shared/components/search/Search';
import FarmTable from './FarmTable';
import FarmCard from './FarmCard';
import {
  Input,
  message,
  Modal,
  Radio,
  Spin,
  Tabs,
  Tooltip,
  Button,
  Table,
} from 'antd';
import * as PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  setPools,
  setShowEligibleDisclaimer,
  setUserLiquidityInPools,
  setShowEligibleLive,
} from '../../actions/liquidity';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DOLLAR_DECIMALS,
  MASTER_POOL_ID,
} from '../../constants/common';
import {
  fetchRestAPRs,
  queryPoolCoinDeserialize,
  queryPoolsList,
  queryPoolSoftLocks,
} from '../../services/liquidity/query';
import {
  amountConversion,
  denomConversion,
  fixedDecimal,
  getDenomBalance,
} from '../../utils/coin';
import MyDropdown from '../../shared/components/dropDown/Dropdown';
import { NextImage } from '../../shared/image/NextImage';
import {
  Fire,
  List,
  ListWhite,
  No_Data,
  Rocket,
  Square,
  SquareWhite,
  Info2,
} from '../../shared/image';
import Liquidity from './Liquidity';
import Lottie from 'lottie-react';
import CreatePool from './CreatePool/index';
import Timer from '../../shared/components/Timer';
import { commaSeparator, marketPrice } from '../../utils/number';
import Loading from '../../pages/Loading';
import PoolCardRow from '../portfolio/MyPoolRow';
import ShowAPR from '../portfolio/ShowAPR';
import NoDataIcon from '../../shared/components/NoDataIcon';

const MasterPoolsContent = [
  <div key={'1'}>
    Providing liquidity only in Master pool makes you eligible for the External
    APR on Master pool. To be eligible to Earn ‘Master pool’ APR an equal amount
    of liquidity has to be provided in any of the child pools. Read more about
    the mechanism{' '}
    <a
      aria-label="here"
      target="_blank"
      rel="noreferrer"
      href="https://docs.cswap.one/farming-rewards"
    >
      {' '}
      here{' '}
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
  showMyPool,
  setUserLiquidityInPools,
  address,
  markets,
  assetMap,
  balances,
  pool,
  rewardsMap,
  setShowEligibleLive,
  showEligibleLive,
}) => {
  const theme = 'dark';
  const TabData = ['All', 'Basic', 'Ranged', 'My Pools'];

  const [active, setActive] = useState('All');
  const [listView, setListView] = useState(false);
  const [masterPoolData, setMasterPoolData] = useState(0);
  const [userPools, setUserPool] = useState();
  const handleActive = (item) => {
    setActive(item);
  };

  const [inProgress, setInProgress] = useState(true);
  const [displayPools, setDisplayPools] = useState([]);
  const [filterValue, setFilterValue] = useState('3');
  const [poolsApr, setPoolsApr] = useState();

  const dispatch = useDispatch();

  const closeDisclaimer = () => {
    setShowEligibleDisclaimer(false);
  };

  const closeDisclaimer2 = () => {
    setShowEligibleLive(false);
  };

  const [isSetOnScroll, setOnScroll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setOnScroll(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const rawUserPools = Object.keys(userLiquidityInPools)?.map((poolKey) =>
      pools?.find(
        (pool) =>
          pool?.id?.toNumber() === Number(poolKey) &&
          Number(userLiquidityInPools[poolKey]) > 0
      )
    );
    const userPools = rawUserPools?.filter((item) => item); // removes undefined values from array
    // setUserPool(rawUserPools?.filter((item) => item)); // removes undefined values from array
    setUserPool(userPools);
  }, [userLiquidityInPools, filterValue, pools, filterValue]);

  const updateFilteredData = useCallback(
    (filterValue, userPools) => {
      setChildPool(false);
      if (filterValue !== '3') {
        if (filterValue === '4') {
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
        if (error) {
          message.error(error);
          setInProgress(false);
          return;
        }

        setPools(result.pools);
        setInProgress(false);
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
      type: 'BALANCE_REFRESH_SET',
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
  }, [poolsApr, pools]);

  const tabItems = [
    {
      key: '3',
      label: 'All',
    },
    {
      key: '1',
      label: 'Basic',
      disabled: Object.keys(userLiquidityInPools).length === 0 ? true : false,
    },
    {
      key: '2',
      label: 'Ranged',
      disabled: Object.keys(userLiquidityInPools).length === 0 ? true : false,
    },
    {
      key: '4',
      label: 'My Pools',
      disabled: Object.keys(userLiquidityInPools).length === 0 ? true : false,
    },
  ];

  const onSearchChange = (searchKey) => {
    const searchTerm = searchKey.trim().toLowerCase();
    if (searchTerm) {
      let resultsObj = displayPools.filter((pool) => {
        return (
          denomConversion(pool?.balances?.baseCoin?.denom)
            ?.toLowerCase()
            .match(new RegExp(searchTerm, 'g')) ||
          denomConversion(pool?.balances?.quoteCoin?.denom)
            ?.toLowerCase()
            .match(new RegExp(searchTerm, 'g')) ||
          String(pool.id?.toNumber()).match(new RegExp(searchTerm, 'g'))
        );
      });

      setDisplayPools(resultsObj);
    } else {
      updateFilteredData(filterValue);
    }
  };

  useEffect(() => {
    if (showMyPool) {
      setFilterValue('4');
    }
  }, []);

  const [filterValue1, setFilterValue1] = useState('');

  const Items = [
    {
      key: 'item-2',
      label: (
        <div className={styles.dropdown__farm}>
          <div className="filter-button-radio">
            <Radio.Group
              onChange={(event) => handleSortBy(event.target.value, pools)}
              defaultValue="a"
              value={filterValue1}
            >
              <Radio.Button value={'Pool Pair'}>Pool Pair</Radio.Button>
              <Radio.Button value={'APR'}>APR</Radio.Button>
              <Radio.Button value={'Pool Liquidity'}>
                Pool Liquidity
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      ),
    },
  ];

  const [isMasterPoolModalOpen, setMasterPoolModalOpen] = useState(false);
  const [isChildPool, setChildPool] = useState(false);

  const handleMasterPoolCancel = () => {
    setMasterPoolModalOpen(false);
  };

  useEffect(() => {
    if (isChildPool) {
      let temp = [];
      displayPools.map((item) => {
        const hasMasterPool = poolsApr?.[
          item?.id?.toNumber()
        ]?.incentive_rewards?.some((pool) => pool.master_pool);

        if (!hasMasterPool) {
          temp.push(item);
        }
      });
      setDisplayPools(temp);
    } else {
      updateFilteredData(filterValue, userPools);
    }
  }, [isChildPool]);

  const handleClick = () => {
    onChange('3');
  };

  console.log({ displayPools });

  const calculatePoolLiquidity = useCallback((poolBalance) => {
    if (poolBalance && Object.values(poolBalance)?.length) {
      const values = Object.values(poolBalance).map(
        (item) =>
          Number(
            amountConversion(item?.amount, assetMap[item?.denom]?.decimals)
          ) * marketPrice(markets, item?.denom)
      );
      return values?.reduce((prev, next) => prev + next, 0); // returning sum value
    } else return 0;
  }, []);

  const getMasterPool = (_id) => {
    const hasMasterPool = rewardsMap?.[_id]?.incentive_rewards?.some(
      (pool) => pool.master_pool
    );
    return hasMasterPool;
  };

  const calculateMasterPoolApr = (_id) => {
    const totalMasterPoolApr = rewardsMap?.[_id]?.incentive_rewards.filter(
      (reward) => reward.master_pool
    );
    // .reduce((acc, reward) => acc + reward.apr, 0);

    return fixedDecimal(totalMasterPoolApr?.[0]?.apr);
  };

  const calculateChildPoolApr = (_id) => {
    const totalApr = rewardsMap?.[_id]?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = rewardsMap?.[_id]?.swap_fee_rewards.reduce(
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

  const handleSortBy = (value, pools) => {
    setFilterValue1(value);
    if (value === 'Pool Liquidity') {
      const sortedCards = displayPools.sort((a, b) => {
        const aTotalPoolLiquidity = calculatePoolLiquidity(a?.balances);
        const bTotalPoolLiquidity = calculatePoolLiquidity(b?.balances);

        return bTotalPoolLiquidity - aTotalPoolLiquidity;
      });
      setDisplayPools(sortedCards);
    } else if (value === 'APR') {
      const sortedCards = displayPools.sort((a, b) => {
        const aTotalPoolLiquidity = calculateApr(a?.id?.toNumber()) || 0;

        const bTotalPoolLiquidity = calculateApr(b?.id?.toNumber()) || 0;

        return bTotalPoolLiquidity - aTotalPoolLiquidity;
      });
      setDisplayPools(sortedCards);
    } else if (value === 'Pool Pair') {
      const sortedCards = displayPools.sort((a, b) => {
        return denomConversion(a?.balances?.quoteCoin?.denom)?.localeCompare(
          denomConversion(b?.balances?.quoteCoin?.denom)
        );
      });
      setDisplayPools(sortedCards);
    }
  };

  const [poolAll, setPoolAll] = useState([])

  useEffect(() => {
    const combinedTx = displayPools.sort((a, b) => {
      const aHasMasterPool = getMasterPool(a?.id?.toNumber()) || 0;
  
      const bHasMasterPool = getMasterPool(b?.id?.toNumber()) || 0;
  
      return aHasMasterPool === bHasMasterPool ? 0 : aHasMasterPool ? -1 : 1;
    });

    setPoolAll(combinedTx)
  }, [displayPools])

  

  return (
    <div
      className={`${styles.farm__wrap}  ${
        showEligibleDisclaimer ? styles.show__text__alert : styles.text__alert
      }`}
    >
      <div
        className={`${styles.farm__main} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        {showEligibleDisclaimer && (
          <div
            className={
              isSetOnScroll
                ? 'farm-disclaimer-info'
                : 'fixedHeaderOnScroll farm-disclaimer-info'
            }
          >
            <div className="reward">
              {/* <Icon className={"bi bi-info-square"} /> */}
              <NextImage src={Info2} alt="Info" height={15} width={15} />
              Users need to farm for 24 hours in order to be eligible for
              rewards.
              <Icon className={'bi bi-x-lg'} onClick={closeDisclaimer} />
            </div>
            <div className="distribution">
              {incentivesMap?.[MASTER_POOL_ID]?.nextDistribution ? (
                <Timer
                  text={'Next Reward distribution in '}
                  expiryTimestamp={
                    incentivesMap?.[MASTER_POOL_ID]?.nextDistribution
                  }
                />
              ) : null}
            </div>
          </div>
        )}

        {showEligibleLive && (
          <div
            className={`${styles.farm__header} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farm__crosss} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <Icon className={'bi bi-x-lg'} onClick={closeDisclaimer2} />
            </div>
            <div
              className={`${styles.farm__header__body__left} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farm__header__left__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'cSwap v2 Live'}
              </div>
              <div
                className={`${styles.farm__header__left__description} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div>
                  {
                    'Supercharge Your LP Earnings with boosted rewards on cSwap.'
                  }
                  <span
                    className={`${styles.farm__header__left__more} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                    onClick={() =>
                      window.open(
                        'https://docs.cswap.one/farming-rewards',
                        '_blank'
                      )
                    }
                  >
                    {'learn more'}
                  </span>
                </div>
              </div>
              <div
                className={`${styles.farm__header__right__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farm__header__right__body} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.farm__header__right__body__background
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <div
                      className={`${styles.farm__header__right__body__step} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <div
                        className={`${
                          styles.farm__header__right__body__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'STEP 1'}
                      </div>
                      <div
                        className={`${
                          styles.farm__header__right__body__button
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                        onClick={() => setMasterPoolModalOpen(true)}
                      >
                        {'Go to master pool'}
                      </div>
                    </div>

                    <div
                      className={`${
                        styles.farm__header__right__body__description
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'Provide liquidity in the Master pool'}
                    </div>
                  </div>
                </div>
                <div
                  className={`${styles.farm__header__right__body} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.farm__header__right__body__background
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <div
                      className={`${styles.farm__header__right__body__step} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <div
                        className={`${
                          styles.farm__header__right__body__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'STEP 2'}
                      </div>
                      <div
                        className={`${
                          styles.farm__header__right__body__button
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                        onClick={() => setChildPool(!isChildPool)}
                      >
                        {isChildPool ? 'Go to all pools' : 'Go to child pools'}
                      </div>
                    </div>

                    <div
                      className={`${
                        styles.farm__header__right__body__description
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {`Deposit Equal value of assets in Child Pool 
                    or pools as your Master Pool to 
                    earn boosted rewards`}
                    </div>
                  </div>
                </div>
              </div>

              {/* <div
              className={`${styles.farm__header__animation} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {/* <NextImage src={Fire} alt="Logo" /> */}
              {/* </div> */}
            </div>
            <div
              className={`${styles.farm__header__body__right} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <Lottie
                animationData={Rocket}
                loop={true}
                style={{ height: 300 }}
              />

              {/* <div
              className={`${styles.farm__header__right__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"How to earn boosted rewards in 2 steps?"}
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
                    onClick={() => setMasterPoolModalOpen(true)}
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
                  <div
                    className={`${styles.farm__header__right__body__button} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                    onClick={() => setChildPool(!isChildPool)}
                  >
                    {isChildPool ? "Go to All Pools" : "Go to Child Pools"}
                  </div>
                </div>
              </div>
            </div> */}
            </div>
          </div>
        )}
        <div
          className={`${styles.farm__body} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farm__body__left} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farm__body__tab__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
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
                theme === 'dark' ? styles.dark : styles.light
              }`}
            />
            <div
              className={`${styles.farm__body__icon__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {!listView ? (
                <>
                  {filterValue !== '4' && (
                    <NextImage
                      src={SquareWhite}
                      onClick={() => setListView(false)}
                      height={15}
                      width={15}
                    />
                  )}

                  <NextImage
                    src={List}
                    onClick={() => setListView(true)}
                    height={15}
                    width={15}
                  />
                </>
              ) : (
                <>
                  {filterValue !== '4' && (
                    <NextImage
                      src={Square}
                      onClick={() => setListView(false)}
                      height={15}
                      width={15}
                    />
                  )}

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
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div>
              <CreatePool
                refreshData={updatePools}
                refreshBalance={handleBalanceRefresh}
              />
            </div>

            <MyDropdown
              items={Items}
              placement={'bottomRight'}
              trigger={['click']}
              className="farm-sort"
            >
              <div
                className={`${styles.farm__body__filter__wrap} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <Icon className={'bi bi-funnel-fill'} />
                {filterValue1 ? filterValue1 : 'Sort By'}
              </div>
            </MyDropdown>
            <div
              className={`${styles.farm__body__search__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <Input
                placeholder="Search Pools.."
                onChange={(event) => onSearchChange(event.target.value)}
                className="asset_search_input"
              />
              <Icon className={'bi bi-search'} />
            </div>
          </div>
        </div>
        <div
          className={`${styles.farm__footer} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          {listView ? (
            <div
              className={`${styles.farm__table__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <FarmTable
                theme={theme}
                pool={poolAll}
                poolsApr={poolsApr}
                poolAprList={poolsApr && poolsApr}
                noDataButton={filterValue === '4' ? true : false}
                handleClick={handleClick}
              />
            </div>
          ) : inProgress ? (
            <div className={`${styles.table__empty__data__wrap}`}>
              <Loading />
            </div>
          ) : !inProgress && displayPools.length <= 0 ? (
            <div className={`${styles.table__empty__data__wrap}`}>
              <div className={`${styles.table__empty__data}`}>
                <NextImage src={No_Data} alt="Message" height={60} width={60} />
                <span>
                  {filterValue === '4'
                    ? 'No Liquidity Provided'
                    : 'No Pools Exist'}
                </span>
                {filterValue === '4' && (
                  <Button
                    type="primary"
                    className="btn-no-data"
                    onClick={() => handleClick()}
                  >
                    {'Go To Pools'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`${styles.farm__footer__card__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {poolAll.map((item, i) => {
                return filterValue === '4' ? (
                  setListView(true)
                ) : (
                  <FarmCard
                    key={i}
                    theme={theme}
                    pool={item}
                    poolsApr={poolsApr?.[item?.id?.toNumber()]}
                    poolAprList={poolsApr && poolsApr}
                    masterPoolData={masterPoolData}
                  />
                );
              })}
            </div>
          )}
        </div>
        <Modal
          className={'modal__wrap2'}
          open={isMasterPoolModalOpen}
          onCancel={handleMasterPoolCancel}
          centered={true}
        >
          <Liquidity theme={theme} pool={masterPoolData} />
        </Modal>
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
    address: state.account.address,
    lang: state.language,
    markets: state.oracle.market.list,
    assetMap: state.asset.map,
    balances: state.account.balances.list,
    pools: state.liquidity.pool.list,
    refreshBalance: state.account.refreshBalance,
    masterPoolMap: state.liquidity.masterPoolMap,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    incentivesMap: state.liquidity.incentivesMap,
    showEligibleDisclaimer: state.liquidity.showEligibleDisclaimer,
    showEligibleLive: state.liquidity.showEligibleLive,
    showMyPool: state.liquidity.showMyPool,
    rewardsMap: state.liquidity.rewardsMap,
  };
};

const actionsToProps = {
  setPools,
  setShowEligibleDisclaimer,
  setShowEligibleLive,
  setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(Farm);
