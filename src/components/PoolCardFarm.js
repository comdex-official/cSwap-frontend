import { message } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { setPair } from "../actions/asset";
import { setUserLiquidityInPools } from "../actions/liquidity";
import { DOLLAR_DECIMALS } from "../constants/common";
import ShowAPR from "../containers/Farm/ShowAPR";
import {
  queryLiquidityPair,
  queryPoolCoinDeserialize,
  queryPoolSoftLocks
} from "../services/liquidity/query";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
  getDenomBalance
} from "../utils/coin";
import { commaSeparator, marketPrice } from "../utils/number";
import { iconNameFromDenom } from "../utils/string";
import variables from "../utils/variables";
import { SvgIcon } from "./common";

const PoolCardFarm = ({
  lang,
  pool,
  markets,
  setUserLiquidityInPools,
  userLiquidityInPools,
  address,
  balances,
  rewardsMap,
  parent,
  assetMap,
  setPair,
}) => {
  const [poolPair, setPoolPair] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (pool?.pairId) {
      queryLiquidityPair(pool?.pairId, (error, result) => {
        if (!error) {
          setPoolPair(result?.pair);
        }
      });
    }
  }, [pool]);

  useEffect(() => {
    if (pool?.id && address) {
      getUserLiquidity(pool);
    }
  }, [pool, address, markets]);

  const calculatePoolLiquidity = useCallback(
    (poolBalance) => {
      if (poolBalance && poolBalance.length > 0) {
        const values = poolBalance.map(
          (item) =>
            Number(
              amountConversion(item?.amount, assetMap[item?.denom]?.decimals)
            ) * marketPrice(markets, item?.denom)
        );
        return values?.reduce((prev, next) => prev + next, 0); // returning sum value
      } else return 0;
    },
    [markets, assetMap]
  );

  const TotalPoolLiquidity = commaSeparatorWithRounding(
    calculatePoolLiquidity(pool?.balances),
    DOLLAR_DECIMALS
  );

  const showPairDenoms = () => {
    if (poolPair?.baseCoinDenom) {
      return `${denomConversion(poolPair?.baseCoinDenom)}/${denomConversion(
        poolPair?.quoteCoinDenom
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
            setUserLiquidityInPools(pool?.id, totalLiquidityInDollar);
          }
        });
      });
    }
  };

  const handleNavigate = () => {
    setPair(poolPair);
    navigate(`/farm/${pool.id && pool.id.toNumber()}`);
  };

  return (
    <div className="poolcard-two" onClick={() => handleNavigate()}>
      <div className="poolcard-two-inner">
        <div className="card-upper">
          <div className="card-svg-icon-container">
            <div className="card-svgicon card-svgicon-1">
              <div className="card-svgicon-inner">
                <SvgIcon name={iconNameFromDenom(poolPair?.baseCoinDenom)} />{" "}
              </div>
            </div>
            <div className="card-svgicon  card-svgicon-2">
              <div className="card-svgicon-inner">
                <SvgIcon name={iconNameFromDenom(poolPair?.quoteCoinDenom)} />{" "}
              </div>
            </div>
            <h3>{showPairDenoms()}</h3>
          </div>
        </div>
        <div className="card-bottom">
          <div className="d-flex flex-column">
            <div className="cardbottom-row">
              <label>{variables[lang].poolLiquidity}</label>
              <p>{`$${TotalPoolLiquidity}`}</p>
            </div>
            <div className="cardbottom-row">
              {parent === "user" ? (
                <>
                  <label>My Liquidity</label>
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
          <div className="cardbottom-row">
            <label>{variables[lang].apr}</label>
            <div className="percent-box-parent">
              <ShowAPR pool={pool} isSwapFee={true} />
            </div>
            <div className="swap-apr mt-1">
              Swap APR -{" "}
              {commaSeparator(
                Number(
                  rewardsMap?.[pool?.id?.toNumber()]?.swap_fee_rewards[0]
                    ?.apr || 0
                ).toFixed(DOLLAR_DECIMALS)
              )}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PoolCardFarm.propTypes = {
  setPair: PropTypes.func.isRequired,
  setUserLiquidityInPools: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  lang: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
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
  rewardsMap: PropTypes.object,
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    markets: state.oracle.market.list,
    rewardsMap: state.liquidity.rewardsMap,
    lang: state.language,
    balances: state.account.balances.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    assetMap: state.asset.map,
  };
};

const actionsToProps = {
  setUserLiquidityInPools,
  setPair,
};

export default connect(stateToProps, actionsToProps)(PoolCardFarm);
