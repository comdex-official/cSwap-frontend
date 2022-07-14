import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { amountConversion, denomConversion } from "../../utils/coin";
import { SvgIcon } from "../../components/common";
import { connect } from "react-redux";
import { iconNameFromDenom } from "../../utils/string";
import { calculateDollarValue, marketPrice } from "../../utils/number";
import {
  queryFarmedPoolCoin,
  queryLiquidityPair,
  queryPoolCoinDeserialize,
} from "../../services/liquidity/query";
import { message } from "antd";
import { setPoolApr } from "../../actions/liquidity";
import { comdex } from "../../config/network";

const PoolCardRow = ({ pool, markets, rewardMap, incentives, setPoolApr }) => {
  const [pair, setPair] = useState();
  const [dollarValuePerDay, setDollarValuePerDay] = useState();
  const [farmedTokensDollarValue, setFarmedTokensDollarValue] = useState();
  const [poolPrice, setPoolPrice] = useState();

  useEffect(() => {
    if (pool?.pairId) {
      queryLiquidityPair(pool?.pairId, (error, result) => {
        if (!error) {
          setPair(result?.pair);
        }
      });

      calculatePoolPrice(pool?.balances);
    }
  }, [pool]);

  useEffect(() => {
    if (pool?.id && rewardMap[pool?.id?.low]) {
      getPoolDollarValue();
    }
  }, [pool, markets, incentives]);

  useEffect(() => {
    if (pool?.id && rewardMap[pool?.id?.low] && poolPrice) {
      getFarmedPoolCoin();
    }
  }, [pool, markets, incentives, poolPrice]);

  useEffect(() => {
    if (dollarValuePerDay && farmedTokensDollarValue) {
      setPoolApr(
        pool?.id,
        (dollarValuePerDay / farmedTokensDollarValue) * 365 * 100
      );
    } else if (dollarValuePerDay && !farmedTokensDollarValue) {
      setPoolApr(pool?.id, dollarValuePerDay * 365 * 100);
    }
  }, [farmedTokensDollarValue, dollarValuePerDay]);

  const calculatePoolPrice = (poolBalance) => {
    const poolPrice =
      (poolBalance && poolBalance[0] && poolBalance[0].amount) /
      (poolBalance && poolBalance[1] && poolBalance[1].amount);

    if (poolPrice) {
      setPoolPrice(Number(poolPrice).toFixed(comdex.coinDecimals));
    }
  };

  const getPoolDollarValue = () => {
    let dollarValue = calculateDollarValue(
      rewardMap,
      markets,
      pool?.id.toNumber(),
      "normalRewards"
    );

    const poolIncentive =
      incentives?.length > 0 &&
      incentives.find((item) => item.poolId.toNumber() === pool?.id.toNumber());

    if (poolIncentive?.totalEpochs?.low) {
      setDollarValuePerDay(dollarValue / poolIncentive?.totalEpochs?.low);
    }
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
      <div className="assets-withicon">
        <div className="assets-icon assets-icon-1">
          <SvgIcon
            name={iconNameFromDenom(pair?.baseCoinDenom)}
            viewBox="0 0 23.515 31"
          />{" "}
        </div>
        <div className="assets-icon assets-icon-2">
          <SvgIcon name={iconNameFromDenom(pair?.quoteCoinDenom)} />{" "}
        </div>
        {denomConversion(pair?.baseCoinDenom)}-
        {denomConversion(pair?.quoteCoinDenom)}
      </div>
    </>
  );
};

PoolCardRow.propTypes = {
  setPoolApr: PropTypes.func.isRequired,
  lang: PropTypes.string,
  incentives: PropTypes.arrayOf(
    PropTypes.shape({
      poolId: PropTypes.shape({
        low: PropTypes.number,
      }),
      totalEpochs: PropTypes.shape({
        low: PropTypes.number,
      }),
    })
  ),
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
  poolIndex: PropTypes.number,
  rewardMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    markets: state.oracle.market.list,
    rewardMap: state.liquidity.rewardMap,
    incentives: state.liquidity.incentives,
  };
};

const actionsToProps = {
  setPoolApr,
};

export default connect(stateToProps, actionsToProps)(PoolCardRow);
