import React, { useCallback, useEffect, useState } from 'react';
import styles from './Farm.module.scss';
import { NextImage } from '../../shared/image/NextImage';
import { TradePair } from '../../shared/image';
import { Tabs } from 'antd';
import { message } from 'antd';
import * as PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import {
  setFetchBalanceInProgress,
  setPool,
  setPoolBalance,
  setSpotPrice,
  setUserLiquidityInPools,
} from '../../actions/liquidity';
import { queryAllBalances } from '../../services/bank/query';
import {
  queryPool,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
} from '../../services/liquidity/query';
import {
  amountConversion,
  amountConversionWithComma,
  commaSeparatorWithRounding,
  denomConversion,
  getDenomBalance,
} from '../../utils/coin';
import { DOLLAR_DECIMALS } from '../../constants/common';
import { marketPrice } from '../../utils/number';
import Deposit from './Deposit';
import Withdraw from './Withdraw';

const Liquidity = ({
  theme,
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
  refetch,
  setRefetch,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [providedTokens, setProvidedTokens] = useState();
  const [activeSoftLock, setActiveSoftLock] = useState(0);
  const [queuedSoftLocks, setQueuedSoftLocks] = useState(0);

  const id = pool?.id?.toNumber();

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

  const fetchPool = useCallback(
    (id) => {
      queryPool(id, (error, result) => {
        if (error) {
          return;
        }

        setPool(result?.pool);
      });
    },
    [id, setPool]
  );

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

  const queryPoolBalance = (pool) => {
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
      type: 'BALANCE_REFRESH_SET',
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

  const tabItems = [
    {
      label: 'DEPOSIT',
      key: '1',
      children: (
        <Deposit
          pool={pool}
          refreshData={queryPoolBalance}
          updateBalance={handleBalanceRefresh}
          refetch={refetch}
          setRefetch={setRefetch}
        />
      ),
    },
    {
      label: 'WITHDRAW',
      key: '2',
      children: (
        <Withdraw
          pool={pool}
          refreshData={queryPoolBalance}
          updateBalance={handleBalanceRefresh}
          userLockedPoolTokens={userLockedPoolTokens}
          refetch={refetch}
          setRefetch={setRefetch}
        />
      ),
    },
  ];

  return (
    <div
      className={`${styles.liquidityCard__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.liquidityCard__tab} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.liquidityCard__tab__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <Tabs
            defaultActiveKey="1"
            tabBarExtraContent={
              <>
                <div
                  className={`${styles.liquidityCard__trade__pair} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                  onClick={() => router.push('/')}
                >
                  <NextImage src={TradePair} alt={'Arrow'} />
                  {'Trade Pair'}
                </div>
              </>
            }
            items={tabItems}
            className="farm-liquidity-tab"
          />
        </div>
      </div>
    </div>
  );
};

Liquidity.propTypes = {
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

export default connect(stateToProps, actionsToProps)(Liquidity);
