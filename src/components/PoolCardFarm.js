import { message, Tooltip } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { setUserLiquidityInPools } from "../actions/liquidity";
import { DOLLAR_DECIMALS, PRICE_DECIMALS } from "../constants/common";
import ShowAPR from "../containers/Farm/ShowAPR";
import {
  queryPoolCoinDeserialize,
  queryPoolSoftLocks
} from "../services/liquidity/query";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
  getDenomBalance
} from "../utils/coin";
import {
  commaSeparator,
  decimalConversion,
  getAMP,
  marketPrice
} from "../utils/number";
import { iconNameFromDenom } from "../utils/string";
import variables from "../utils/variables";
import { Col, Row, SvgIcon } from "./common";
import RangeTooltipContent from "./RangedToolTip";

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
}) => {
  const navigate = useNavigate();

  const calculatePoolLiquidity = useCallback(
    (poolBalance) => {
      if (poolBalance && Object.values(poolBalance)?.length) {
        const values = Object.values(poolBalance).map(
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
    if (pool?.balances?.baseCoin?.denom) {
      return `${denomConversion(
        pool?.balances?.baseCoin?.denom
      )}/${denomConversion(pool?.balances?.quoteCoin?.denom)}`;
    }
  };

  const getUserLiquidity = useCallback(
    (pool) => {
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
          queryPoolCoinDeserialize(
            pool?.id,
            totalPoolToken,
            (error, result) => {
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
              setUserLiquidityInPools(pool?.id, totalLiquidityInDollar || 0);
            }
          );
        });
      }
    },
    [address, assetMap, balances, markets]
  );

  useEffect(() => {
    // fetching user liquidity for my pools.
    if (pool?.id) {
      getUserLiquidity(pool);
    }
  }, [pool, getUserLiquidity]);

  const handleNavigate = () => {
    navigate(`/farm/${pool.id && pool.id.toNumber()}`);
  };

  return (
    // please add and remove 'ranged-card' class for Ranged
    <div className="poolcard-two ranged-card" onClick={() => handleNavigate()}>
      <div className="poolcard-two-inner">
        <div className="card-upper">
          <div className="card-svg-icon-container">
            <div className="card-svgicon card-svgicon-1">
              <div className="card-svgicon-inner">
                <SvgIcon
                  name={iconNameFromDenom(pool?.balances?.baseCoin?.denom)}
                />{" "}
              </div>
            </div>
            <div className="card-svgicon card-svgicon-2">
              <div className="card-svgicon-inner">
                <SvgIcon
                  name={iconNameFromDenom(pool?.balances?.quoteCoin?.denom)}
                />{" "}
              </div>
            </div>
            <div>
              <div>
                <h3>{showPairDenoms()}</h3>
              </div>
              <p className="pool-id">Pool #{pool?.id?.toNumber()}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="ranged-box">
              <div className="ranged-box-inner">
                <Tooltip
                  overlayClassName="ranged-tooltip ranged-tooltip-small"
                  title={
                    pool?.type === 2 ? (
                      <RangeTooltipContent
                        parent={"pool"}
                        price={Number(decimalConversion(pool?.price)).toFixed(
                          PRICE_DECIMALS
                        )}
                        max={Number(decimalConversion(pool?.maxPrice)).toFixed(
                          PRICE_DECIMALS
                        )}
                        min={Number(decimalConversion(pool?.minPrice)).toFixed(
                          PRICE_DECIMALS
                        )}
                      />
                    ) : null
                  }
                  placement="bottom"
                >
                  {pool?.type === 2
                    ? "Ranged"
                    : pool?.type === 1
                    ? "Basic"
                    : ""}
                  {pool?.type === 2 ? (
                    <SvgIcon name="info-icon" viewbox="0 0 9 9" />
                  ) : null}
                </Tooltip>
              </div>
            </div>
            {pool?.type === 2 ? (
              <div className="percent-box">
                x
                {getAMP(
                  Number(decimalConversion(pool?.price)),
                  Number(decimalConversion(pool?.minPrice)),
                  Number(decimalConversion(pool?.maxPrice))
                )?.toFixed(DOLLAR_DECIMALS)}
              </div>
            ) : null}
          </div>
        </div>
        <div className="card-bottom">
          <Row>
            <Col xs="5">
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
            </Col>
            <Col xs="7">
              <div className="cardbottom-row">
                <label>{variables[lang].apr}</label>
                <div className="percent-box">
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
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

PoolCardFarm.propTypes = {
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
};

export default connect(stateToProps, actionsToProps)(PoolCardFarm);
