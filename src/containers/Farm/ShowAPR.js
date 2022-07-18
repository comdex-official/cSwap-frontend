import { message, Skeleton } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  setFarmedTokensDollarValue,
  setNormalRewardDollarValuePerDay,
  setPoolApr,
  setPoolPrice,
  setSwapApr,
  setSwapRewardDollarValuePerDay
} from "../../actions/liquidity";
import { DOLLAR_DECIMALS } from "../../constants/common";
import {
  queryFarmedPoolCoin,
  queryPoolCoinDeserialize
} from "../../services/liquidity/query";
import { amountConversion } from "../../utils/coin";
import {
  calculateDollarValue,
  commaSeparator,
  getPoolPrice,
  marketPrice
} from "../../utils/number";

const ShowAPR = ({
  pool,
  aprMap,
  rewardMap,
  markets,
  setPoolApr,
  isSwapFee,
  setSwapApr,
  farmedTokensDollarValue,
  setFarmedTokensDollarValue,
  setNormalRewardDollarValuePerDay,
  normalRewardDollarValuePerDay,
  swapRewardDollarValuePerDay,
  setSwapRewardDollarValuePerDay,
  setPoolPrice,
  poolPriceMap,
}) => {
  const [isFetching, setIsFetching] = useState(false);

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
        let { xPoolPrice, yPoolPrice } = getPoolPrice(
          marketPrice(markets, oracleAsset?.denom),
          oracleAsset?.denom,
          firstAsset,
          secondAsset
        );

        setPoolPrice(firstAsset?.denom, xPoolPrice);
        setPoolPrice(secondAsset?.denom, yPoolPrice);
      }
    }
  }, [markets]);

  useEffect(() => {
    if (pool?.id && rewardMap[pool?.id?.low] && markets) {
      getPoolDollarValue();
      getFarmedPoolCoin();
    }
  }, [pool, markets, rewardMap, poolPriceMap]);

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
      setPoolApr(pool?.id, normalRewardDollarValuePerDay[pool?.id] * 365 * 100);
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
    setIsFetching(true);
    queryFarmedPoolCoin(pool?.id, (error, result) => {
      if (error) {
        message.error(error);
        setIsFetching(false);
        return;
      }

      queryPoolCoinDeserialize(
        pool?.id,
        result?.coin?.amount,
        (errorResponse, data) => {
          setIsFetching(false);

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
      {isFetching ? (
        <Skeleton.Button
          className="apr-skeleton"
          active={true}
          size={"small"}
        />
      ) : aprMap[pool?.id?.low] ? (
        `${commaSeparator(
          Number(aprMap[pool?.id?.low]).toFixed(DOLLAR_DECIMALS)
        )}%`
      ) : (
        "-"
      )}
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
    farmedTokensDollarValue: state.liquidity.farmedTokensDollarValue,
    normalRewardDollarValuePerDay:
      state.liquidity.normalRewardDollarValuePerDay,
    swapRewardDollarValuePerDay: state.liquidity.swapRewardDollarValuePerDay,
  };
};

const actionToProps = {
  setPoolApr,
  setSwapApr,
  setNormalRewardDollarValuePerDay,
  setSwapRewardDollarValuePerDay,
  setFarmedTokensDollarValue,
  setPoolPrice,
};

export default connect(stateToProps, actionToProps)(ShowAPR);
