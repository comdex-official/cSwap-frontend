import { message } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { queryPoolCoinDeserialize } from "../../../services/liquidity/query";
import { amountConversion } from "../../../utils/coin";
import { commaSeparator, marketPrice } from "../../../utils/number";

const PoolTokenValue = ({ pool, poolTokens, markets, assetMap }) => {
  const [totalLiquidityInDollar, setTotalLiquidityInDollar] = useState();

  const queryTokensShares = useCallback(
    (pool) => {
      if (poolTokens) {
        queryPoolCoinDeserialize(pool?.id, poolTokens, (error, result) => {
          if (error) {
            message.error(error);
            return;
          }

          const providedTokens = result?.coins;
          const totalLiquidityInDollar =
            Number(
              amountConversion(
                providedTokens?.[0]?.amount,
                assetMap[providedTokens?.[0]?.denom]?.decimals
              )
            ) *
              marketPrice(markets, providedTokens?.[0]?.denom) +
            Number(
              amountConversion(
                providedTokens?.[1]?.amount,
                assetMap[providedTokens?.[1]?.denom]?.decimals
              )
            ) *
              marketPrice(markets, providedTokens?.[1]?.denom);

          if (totalLiquidityInDollar) {
            setTotalLiquidityInDollar(totalLiquidityInDollar);
          }
        });
      }
    },
    [assetMap, markets, poolTokens]
  );

  useEffect(() => {
    if (pool?.poolCoinDenom) {
      queryTokensShares(pool);
    }
  }, [pool, markets, poolTokens, queryTokensShares]);

  return (
    <>
      $
      {commaSeparator(
        Number(poolTokens ? totalLiquidityInDollar || 0 : 0).toFixed(
          DOLLAR_DECIMALS
        )
      )}{" "}
    </>
  );
};

PoolTokenValue.propTypes = {
  lang: PropTypes.string.isRequired,
  assetMap: PropTypes.object,
  markets: PropTypes.object,
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
    assetMap: state.asset.map,
  };
};

export default connect(stateToProps)(PoolTokenValue);
