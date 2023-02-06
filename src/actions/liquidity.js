import { MASTER_POOL_ID } from "../constants/common";
import {
  BASE_COIN_POOL_PRICE_SET,
  FARMED_TOKENS_DOLLAR_VALUE,
  FIRST_RESERVE_COIN_DENOM_SET,
  POOLS_LIQUIDITY_LIST_SET,
  POOLS_SET,
  POOL_BALANCE_FETCH_IN_PROGRESS,
  POOL_BALANCE_SET,
  POOL_INCENTIVES_SET,
  POOL_REWARDS_SET,
  POOL_SET,
  POOL_TOKEN_SUPPLY_SET,
  SECOND_RESERVE_COIN_DENOM_SET,
  SPOT_PRICE_SET,
  USER_LIQUIDITY_IN_DOLLAR_SET,
  USER_LIQUIDITY_IN_POOLS_SET,
  SHOW_ELIGIBLE_DISCLAIMER_SET,
} from "../constants/liquidity";

export const setPools = (list, pagination) => {
  return {
    type: POOLS_SET,
    list,
    pagination,
  };
};

export const setPool = (value) => {
  return {
    type: POOL_SET,
    value,
  };
};

export const setPoolBalance = (list) => {
  return {
    type: POOL_BALANCE_SET,
    list,
  };
};

export const setFetchBalanceInProgress = (value) => {
  return {
    type: POOL_BALANCE_FETCH_IN_PROGRESS,
    value,
  };
};

export const setSpotPrice = (value) => {
  return {
    type: SPOT_PRICE_SET,
    value,
  };
};

export const setFirstReserveCoinDenom = (value) => {
  return {
    type: FIRST_RESERVE_COIN_DENOM_SET,
    value,
  };
};

export const setSecondReserveCoinDenom = (value) => {
  return {
    type: SECOND_RESERVE_COIN_DENOM_SET,
    value,
  };
};

export const setPoolTokenSupply = (value) => {
  return {
    type: POOL_TOKEN_SUPPLY_SET,
    value,
  };
};

export const setPoolLiquidityList = (value, index) => {
  return {
    type: POOLS_LIQUIDITY_LIST_SET,
    value,
    index,
  };
};

export const setBaseCoinPoolPrice = (value, baseValue) => {
  return {
    type: BASE_COIN_POOL_PRICE_SET,
    value,
    baseValue,
  };
};

export const setUserLiquidityInDollar = (value) => {
  return {
    type: USER_LIQUIDITY_IN_DOLLAR_SET,
    value,
  };
};

export const setUserLiquidityInPools = (poolId, value) => {
  return {
    type: USER_LIQUIDITY_IN_POOLS_SET,
    value,
    poolId,
  };
};

export const setPoolIncentives = (list) => {
  let rewardMap = {},
    incentivesMap = {};

  for (let i = 0; i < list.length; i++) {
    if (incentivesMap[list[i].poolId] === undefined) {
      incentivesMap[list[i].poolId] = list[i];
    }

    if (rewardMap[list[i].poolId] === undefined) {
      rewardMap[list[i].poolId] = { normalRewards: {}, swapRewards: {} };
    }

    if (list[i].isSwapFee) {
      if (
        rewardMap[list[i].poolId]["swapRewards"][
          list[i].totalRewards?.denom
        ] === undefined
      ) {
        rewardMap[list[i].poolId]["swapRewards"][
          list[i].totalRewards?.denom
        ] = 0;
      }
      rewardMap[list[i].poolId]["swapRewards"][list[i].totalRewards?.denom] +=
        list[i].totalRewards?.amount / list[i]?.totalEpochs;
    } else {
      if (
        rewardMap[list[i].poolId]["normalRewards"][
          list[i].totalRewards?.denom
        ] === undefined
      ) {
        rewardMap[list[i].poolId]["normalRewards"][
          list[i].totalRewards?.denom
        ] = 0;
      }

      rewardMap[list[i].poolId]["normalRewards"][list[i].totalRewards?.denom] +=
        list[i].totalRewards?.amount / list[i]?.totalEpochs;
    }
  }

  const masterPoolsIds =
    list.length > 0
      ? list?.filter(
          (item) =>
            item?.masterPool === true ||
            item?.poolId?.toNumber() === MASTER_POOL_ID
        )
      : [];

  const masterPoolHashMap = masterPoolsIds?.reduce((map, obj) => {
    map[obj?.poolId] = obj;
    return map;
  }, {});

  return {
    type: POOL_INCENTIVES_SET,
    value: list,
    rewardMap: rewardMap,
    incentivesMap: incentivesMap,
    masterPoolMap: masterPoolHashMap,
  };
};

export const setFarmedTokensDollarValue = (poolId, value) => {
  return {
    type: FARMED_TOKENS_DOLLAR_VALUE,
    value,
    poolId,
  };
};

export const setPoolRewards = (value) => {
  return {
    type: POOL_REWARDS_SET,
    value,
  };
};

export const setShowEligibleDisclaimer = (value) => {
  return {
    type: SHOW_ELIGIBLE_DISCLAIMER_SET,
    value,
  };
};
