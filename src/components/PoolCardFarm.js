import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import variables from "../utils/variables";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getDenomBalance,
} from "../utils/coin";
import { SvgIcon } from "./common";
import { connect } from "react-redux";
import { iconNameFromDenom } from "../utils/string";
import { commaSeparator, marketPrice } from "../utils/number";
import {
  queryLiquidityPair,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks,
} from "../services/liquidity/query";
import { message } from "antd";
import { DOLLAR_DECIMALS } from "../constants/common";
import { setUserLiquidityInPools } from "../actions/liquidity";
import { useNavigate } from "react-router";
import ShowAPR from "../containers/Farm/ShowAPR";

const PoolCardFarm = ({
  lang,
  pool,
  markets,
  userLiquidity,
  setUserLiquidityInPools,
  userLiquidityInPools,
  address,
  balances,
  swapAprMap,
  params,
  parent,
  poolPriceMap,
}) => {
  const [pair, setPair] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (pool?.pairId) {
      queryLiquidityPair(pool?.pairId, (error, result) => {
        if (!error) {
          setPair(result?.pair);
        }
      });
    }
  }, [pool]);

  useEffect(() => {
    if (pool?.id && address) {
      getUserLiquidity(pool);
    }
  }, [pool, address, markets, poolPriceMap]);

  const calculatePoolLiquidity = (poolBalance) => {
    if (poolBalance && poolBalance.length > 0) {
      const values = poolBalance.map(
        (item) =>
          Number(item?.amount) *
          (poolPriceMap[item?.denom] || marketPrice(markets, item?.denom))
      );
      return values.reduce((prev, next) => prev + next, 0); // returning sum value
    } else return 0;
  };

  const TotalPoolLiquidity = amountConversionWithComma(
    calculatePoolLiquidity(pool?.balances),
    2
  );

  const showPairDenoms = () => {
    if (pair?.baseCoinDenom) {
      return `${denomConversion(pair?.baseCoinDenom)}/${denomConversion(
        pair?.quoteCoinDenom
      )}`;
    }
  };

  const getUserLiquidity = (pool) => {
    if (address) {
      queryPoolSoftLocks(address, pool?.id, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        const availablePoolToken =
          getDenomBalance(balances, pool?.poolCoinDenom) || 0;

        const activeSoftLock = result?.activePoolCoin;
        const queuedSoftLocks = result?.queuedPoolCoin;

        const queuedAmounts =
          queuedSoftLocks &&
          queuedSoftLocks.length > 0 &&
          queuedSoftLocks?.map((item) => item?.poolCoin?.amount);
        const userLockedAmount =
          Number(
            queuedAmounts?.length > 0 &&
              queuedAmounts?.reduce((a, b) => Number(a) + Number(b), 0)
          ) + Number(activeSoftLock?.amount) || 0;

        const totalPoolToken = Number(availablePoolToken) + userLockedAmount;
        queryPoolCoinDeserialize(pool?.id, totalPoolToken, (error, result) => {
          if (error) {
            message.error(error);
            return;
          }

          const providedTokens = result?.coins;
          const totalLiquidityInDollar =
            Number(amountConversion(providedTokens?.[0]?.amount)) *
              (poolPriceMap[providedTokens?.[0]?.denom] ||
                marketPrice(markets, providedTokens?.[0]?.denom)) +
            Number(amountConversion(providedTokens?.[1]?.amount)) *
              (poolPriceMap[providedTokens?.[1]?.denom] ||
                marketPrice(markets, providedTokens?.[1]?.denom));

          if (totalLiquidityInDollar) {
            setUserLiquidityInPools(pool?.id, totalLiquidityInDollar);
          }
        });
      });
    }
  };

  return (
    <div
      className="poolcard-two"
      onClick={() => navigate(`/farm-details/${pool.id && pool.id.toNumber()}`)}
    >
      <div className="poolcard-two-inner">
        <div className="card-upper">
          <div className="card-svg-icon-container">
            <div className="card-svgicon card-svgicon-1">
              <div className="card-svgicon-inner">
                <SvgIcon
                  name={iconNameFromDenom(pair?.baseCoinDenom)}
                  viewBox="0 0 23.515 31"
                />{" "}
              </div>
            </div>
            <div className="card-svgicon  card-svgicon-2">
              <div className="card-svgicon-inner">
                <SvgIcon name={iconNameFromDenom(pair?.quoteCoinDenom)} />{" "}
              </div>
            </div>
            <h3>{showPairDenoms()}</h3>
          </div>
        </div>
        <div className="card-bottom">
          <div className="cardbottom-row">
            <label>{variables[lang].poolLiquidity}</label>
            <p>{`$${TotalPoolLiquidity}`}</p>
          </div>
          <div className="cardbottom-row">
            <label>{variables[lang].apr}</label>
            <p>
              <ShowAPR pool={pool} isSwapFee={true} />
            </p>
            <div className="percent-box">
              {commaSeparator(
                Number(swapAprMap[pool?.id?.low] || 0).toFixed(DOLLAR_DECIMALS)
              )}
              % <SvgIcon name={iconNameFromDenom(params?.swapFeeDistrDenom)} />
            </div>
          </div>

          <div className="cardbottom-row">
            {parent === "user" && userLiquidity ? (
              <>
                <label>Liquidity</label>
                <p>
                  $
                  {commaSeparator(
                    Number(userLiquidityInPools[pool?.id] || 0).toFixed(
                      DOLLAR_DECIMALS
                    )
                  )}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

PoolCardFarm.propTypes = {
  setUserLiquidityInPools: PropTypes.func.isRequired,
  address: PropTypes.string,
  lang: PropTypes.string,
  aprMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
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
  params: PropTypes.shape({
    swapFeeDistrDenom: PropTypes.string,
  }),
  parent: PropTypes.string,
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
  poolPriceMap: PropTypes.object,
  swapAprMap: PropTypes.object,
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    markets: state.oracle.market.list,
    swapAprMap: state.liquidity.swapAprMap,
    lang: state.language,
    balances: state.account.balances.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    params: state.swap.params,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

const actionsToProps = {
  setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(PoolCardFarm);
