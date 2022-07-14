import PropTypes from "prop-types";
import {
  calculateDollarValue,
  commaSeparator,
  marketPrice,
} from "../../utils/number";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { useEffect, useState } from "react";
import {
  queryFarmedPoolCoin,
  queryLiquidityParams,
  queryPoolCoinDeserialize,
} from "../../services/liquidity/query";
import { message } from "antd";
import { amountConversion } from "../../utils/coin";
import { connect } from "react-redux";
import { setPoolApr, setSwapApr } from "../../actions/liquidity";
import { setParams } from "../../actions/swap";

const ShowAPR = ({
  pool,
  aprMap,
  rewardMap,
  markets,
  setPoolApr,
  isSwapFee,
  setSwapApr,
}) => {
  const [normalRewardDollarValuePerDay, setNormalRewardDollarValuePerDay] =
    useState();
  const [swapRewardDollarValuePerDay, setSwapRewardDollarValuePerDay] =
    useState();

  const [farmedTokensDollarValue, setFarmedTokensDollarValue] = useState();

  useEffect(() => {
    if (isSwapFee) {
      fetchParams();
    }
  }, [isSwapFee]);

  useEffect(() => {
    if (pool?.id && rewardMap[pool?.id?.low]) {
      getPoolDollarValue();
      getFarmedPoolCoin();
    }
  }, [pool, markets]);

  useEffect(() => {
    if (normalRewardDollarValuePerDay && farmedTokensDollarValue) {
      setPoolApr(
        pool?.id,
        (normalRewardDollarValuePerDay / farmedTokensDollarValue) * 365 * 100
      );
    } else if (normalRewardDollarValuePerDay && !farmedTokensDollarValue) {
      setPoolApr(pool?.id, normalRewardDollarValuePerDay * 365 * 100);
    }
  }, [farmedTokensDollarValue, normalRewardDollarValuePerDay]);

  useEffect(() => {
    if (swapRewardDollarValuePerDay && farmedTokensDollarValue && isSwapFee) {
      setSwapApr(
        pool?.id,
        (swapRewardDollarValuePerDay / farmedTokensDollarValue) * 365 * 100
      );
    } else if (
      swapRewardDollarValuePerDay &&
      !farmedTokensDollarValue &&
      isSwapFee
    ) {
      setSwapApr(pool?.id, swapRewardDollarValuePerDay * 365 * 100);
    }
  }, [farmedTokensDollarValue, swapRewardDollarValuePerDay]);

  const fetchParams = () => {
    console.log("fetching params");
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

    setNormalRewardDollarValuePerDay(normalRewardDollarValue);
    setSwapRewardDollarValuePerDay(swapRewardDollarValue);
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
              marketPrice(markets, providedTokens?.[0]?.denom) +
            Number(amountConversion(providedTokens?.[1]?.amount)) *
              marketPrice(markets, providedTokens?.[1]?.denom);

          if (totalLiquidityInDollar) {
            setFarmedTokensDollarValue(totalLiquidityInDollar);
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
  aprMap: PropTypes.object,
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

  rewardMap: PropTypes.object,
  swapAprMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    markets: state.oracle.market.list,
    rewardMap: state.liquidity.rewardMap,
    aprMap: state.liquidity.aprMap,
    swapAprMap: state.liquidity.swapAprMap,
    params: state.swap.params,
  };
};

const actionToProps = {
  setPoolApr,
  setSwapApr,
  setParams,
};

export default connect(stateToProps, actionToProps)(ShowAPR);
