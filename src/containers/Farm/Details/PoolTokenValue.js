import React, { useEffect, useState } from "react";
import { amountConversion } from "../../../utils/coin";
import { marketPrice } from "../../../utils/number";
import { message } from "antd";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { queryPoolCoinDeserialize } from "../../../services/liquidity/query";

const PoolTokenValue = ({ pool, poolTokens, markets }) => {
  const [totalLiquidityInDollar, setTotalLiquidityInDollar] = useState();

  useEffect(() => {
    if (pool?.poolCoinDenom) {
      queryTokensShares(pool);
    }
  }, [pool, markets, poolTokens]);

  const queryTokensShares = (pool) => {
    if (poolTokens) {
      queryPoolCoinDeserialize(pool?.id, poolTokens, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        const providedTokens = result?.coins;
        const totalLiquidityInDollar =
          Number(amountConversion(providedTokens?.[0]?.amount)) *
            marketPrice(markets, providedTokens?.[0]?.denom) +
          Number(amountConversion(providedTokens?.[1]?.amount)) *
            marketPrice(markets, providedTokens?.[1]?.denom);

        if (totalLiquidityInDollar) {
          setTotalLiquidityInDollar(totalLiquidityInDollar);
        }
      });
    }
  };

  return (
    <>
      $
      {Number(poolTokens ? totalLiquidityInDollar || 0 : 0).toFixed(
        DOLLAR_DECIMALS
      ) || 0}{" "}
    </>
  );
};

PoolTokenValue.propTypes = {
  lang: PropTypes.string.isRequired,
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
  }),
  poolTokens: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    pool: state.liquidity.pool._,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
  };
};

export default connect(stateToProps)(PoolTokenValue);
