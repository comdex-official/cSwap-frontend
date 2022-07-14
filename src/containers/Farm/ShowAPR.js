import PropTypes from "prop-types";
import {
  calculateDollarValue,
  commaSeparator,
  marketPrice,
} from "../../utils/number";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { useEffect } from "react";
import {
  queryFarmedPoolCoin,
  queryLiquidityParams,
  queryPoolCoinDeserialize,
} from "../../services/liquidity/query";
import { message } from "antd";
import { amountConversion } from "../../utils/coin";
import { connect } from "react-redux";
import {
  setFarmedTokensDollarValue,
  setNormalRewardDollarValuePerDay,
  setPoolApr,
  setSwapApr,
  setPoolPrice,
  setSwapRewardDollarValuePerDay,
} from "../../actions/liquidity";
import { setParams } from "../../actions/swap";

const ShowAPR = ({
  pool,
  aprMap,
  rewardMap,
  markets,
  setPoolApr,
  isSwapFee,
  setSwapApr,
  setParams,
  farmedTokensDollarValue,
  setFarmedTokensDollarValue,
  setNormalRewardDollarValuePerDay,
  normalRewardDollarValuePerDay,
  swapRewardDollarValuePerDay,
  setSwapRewardDollarValuePerDay,
  setPoolPrice,
  poolPriceMap,
}) => {
  useEffect(() => {
    if (isSwapFee) {
      fetchParams();
    }
  }, [isSwapFee]);

  useEffect(() => {
    if (pool?.id) {
      let firstAsset = pool?.balances[0];
      let secondAsset = pool?.balances[1];

      let oracleAsset = {};
      if (marketPrice(markets, firstAsset?.denom)) {
        oracleAsset = firstAsset;
      } else if (marketPrice(markets, secondAsset?.denom)) {
        oracleAsset = secondAsset;
      }

      if (oracleAsset?.denom) {
        getPoolPrice(
          marketPrice(markets, oracleAsset?.denom),
          oracleAsset?.denom,
          firstAsset,
          secondAsset
        );
      }
    }
  }, [pool]);

  const getPoolPrice = (
    oraclePrice,
    oracleAssetDenom,
    firstAsset,
    secondAsset
  ) => {
    let x = firstAsset?.amount,
      y = secondAsset?.amount,
      xPoolPrice,
      yPoolPrice;

    if (oracleAssetDenom === firstAsset?.denom) {
      yPoolPrice = (x / y) * oraclePrice;
      xPoolPrice = (y / x) * yPoolPrice;
    } else {
      xPoolPrice = (y / x) * oraclePrice;
      yPoolPrice = (x / y) * xPoolPrice;
    }

    setPoolPrice(firstAsset?.denom, xPoolPrice);
    setPoolPrice(secondAsset?.denom, yPoolPrice);
  };

  useEffect(() => {
    if (pool?.id && rewardMap[pool?.id?.low] && markets) {
      getPoolDollarValue();
      getFarmedPoolCoin();
    }
  }, [pool, markets, rewardMap]);

  useEffect(() => {
    if (
      normalRewardDollarValuePerDay[pool?.id] &&
      farmedTokensDollarValue[pool?.id]
    ) {
      setPoolApr(
        pool?.id,
        (normalRewardDollarValuePerDay[pool?.id] /
          farmedTokensDollarValue[pool?.id]) *
          365 *
          100
      );
    } else if (
      normalRewardDollarValuePerDay[pool?.id] &&
      !farmedTokensDollarValue[pool?.id]
    ) {
      setPoolApr(pool?.id, normalRewardDollarValuePerDay * 365 * 100);
    }
  }, [farmedTokensDollarValue, normalRewardDollarValuePerDay, pool]);

  useEffect(() => {
    if (
      swapRewardDollarValuePerDay[pool?.id] &&
      farmedTokensDollarValue[pool?.id] &&
      isSwapFee
    ) {
      setSwapApr(
        pool?.id,
        (swapRewardDollarValuePerDay[pool?.id] /
          farmedTokensDollarValue[pool?.id]) *
          365 *
          100
      );
    } else if (
      swapRewardDollarValuePerDay[pool?.id] &&
      !farmedTokensDollarValue[pool?.id] &&
      isSwapFee
    ) {
      setSwapApr(pool?.id, swapRewardDollarValuePerDay[pool?.id] * 365 * 100);
    }
  }, [farmedTokensDollarValue, swapRewardDollarValuePerDay]);

  const fetchParams = () => {
    queryLiquidityParams((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      if (result?.params) {
        setParams(result?.params);
      }
    });
  };

  const getPoolDollarValue = () => {
    let normalRewardDollarValue = calculateDollarValue(
      rewardMap,
      markets,
      pool?.id.toNumber(),
      "normalRewards"
    );
    let swapRewardDollarValue = calculateDollarValue(
      rewardMap,
      markets,
      pool?.id.toNumber(),
      "swapRewards"
    );

    setNormalRewardDollarValuePerDay(pool?.id, normalRewardDollarValue);
    setSwapRewardDollarValuePerDay(pool?.id, swapRewardDollarValue);
  };

  const getFarmedPoolCoin = () => {
    queryFarmedPoolCoin(pool?.id, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      queryPoolCoinDeserialize(
        pool?.id,
        result?.coin?.amount,
        (errorResponse, data) => {
          if (errorResponse) {
            message.error(errorResponse);
            return;
          }

          const providedTokens = data?.coins;

          const totalLiquidityInDollar =
            Number(amountConversion(providedTokens?.[0]?.amount)) *
              (poolPriceMap[providedTokens?.[0]?.denom] ||
                marketPrice(markets, providedTokens?.[0]?.denom)) +
            Number(amountConversion(providedTokens?.[1]?.amount)) *
              (poolPriceMap[providedTokens?.[1]?.denom] ||
                marketPrice(markets, providedTokens?.[1]?.denom));

          if (totalLiquidityInDollar) {
            setFarmedTokensDollarValue(pool?.id, totalLiquidityInDollar);
          }
        }
      );
    });
  };

  return (
    <>
      {aprMap[pool?.id?.low]
        ? `${commaSeparator(
            Number(aprMap[pool?.id?.low]).toFixed(DOLLAR_DECIMALS)
          )}%`
        : "-"}
    </>
  );
};

ShowAPR.propTypes = {
  setFarmedTokensDollarValue: PropTypes.func.isRequired,
  setNormalRewardDollarValuePerDay: PropTypes.func.isRequired,
  setPoolPrice: PropTypes.func.isRequired,
  setSwapRewardDollarValuePerDay: PropTypes.func.isRequired,
  aprMap: PropTypes.object,
  farmedTokensDollarValue: PropTypes.object,
  isSwapFee: PropTypes.bool,
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
  normalRewardDollarValuePerDay: PropTypes.object,
  params: PropTypes.shape({
    swapFeeDistrDenom: PropTypes.string,
  }),
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
    reserveCoinDenoms: PropTypes.array,
  }),

  poolPriceMap: PropTypes.object,
  rewardMap: PropTypes.object,
  swapAprMap: PropTypes.object,
  swapRewardDollarValuePerDay: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    markets: state.oracle.market.list,
    rewardMap: state.liquidity.rewardMap,
    aprMap: state.liquidity.aprMap,
    swapAprMap: state.liquidity.swapAprMap,
    poolPriceMap: state.liquidity.poolPriceMap,
    params: state.swap.params,
    farmedTokensDollarValue: state.liquidity.farmedTokensDollarValue,
    normalRewardDollarValuePerDay:
      state.liquidity.normalRewardDollarValuePerDay,
    swapRewardDollarValuePerDay: state.liquidity.swapRewardDollarValuePerDay,
  };
};

const actionToProps = {
  setPoolApr,
  setSwapApr,
  setParams,
  setNormalRewardDollarValuePerDay,
  setSwapRewardDollarValuePerDay,
  setFarmedTokensDollarValue,
  setPoolPrice,
};

export default connect(stateToProps, actionToProps)(ShowAPR);
