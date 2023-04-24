import { Button, message, Tooltip } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
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

  const[showDtl,setShowDtl]=useState(false);

  const onClickShowDtl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDtl(!showDtl);
  }

  return (
    <div className="poolcard-two ranged-card">
      <div className="poolcard-two-inner">
        <div className="card-upper">
          <div className="card-icon-container">
            <div className="card-icon-container-inner">
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
            </div>
            <div>
              <h3>{showPairDenoms()}</h3>
              <p className="pool-id">Pool #{pool?.id?.toNumber()}</p>
            </div>
          </div>
          <div className="upper-right">
            <div className="tags tag1">
              <div className="tag-inner">
                Basic
              </div>
            </div>
            <div className="tags tag2">
              <div className="tag-inner">
                Master Pool
              </div>
            </div>
            <div>
              <div className="tags tag1">
                <div className="tag-inner">
                  External Incentives
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-bottom">
          <Row className='cardbottom-row align-items-center'>
            <Col>
              <label>APR</label>
            </Col>
            <Col className='text-right'>
              <Tooltip title='Total APR (incl. MP Rewards): 54.45% *Base APR (CMDX yield only): 11.02% *Swap Fees APR: 3.43% *Available MP Boost: Up to +40% for providing liquidity in the Master Pool'>
                14.45%
              </Tooltip>
              <div className="tags tag2">
                <div className="tag-inner">
                  Upto 54.45%
                </div>
              </div>
            </Col>
          </Row>
          <Row className='cardbottom-row align-items-center mt-2'>
            <Col>
              <label>Total Liquidity</label>
            </Col>
            <Col className='text-right'>
              $117,402,993
            </Col>
          </Row>
          <Row className='cardbottom-row align-items-center mt-2'>
            <Col>
              <label>MP Boost <span className="upto-text"><Tooltip title='Provide equivalent liquidity in the Master pool to earn boost'>Upto +40%</Tooltip></span></label>
            </Col>
            <Col className='text-right'>
              <Button type="primary">Go to Pool</Button>
            </Col>
          </Row>
          <Row className='py-3 text-center'>
            <Col>
              <Button className="px-5" type="primary">Add Liquidity</Button>
            </Col>
          </Row>
          <Row>
            <Button className="showdetails-btn" type="text" onClick={onClickShowDtl}>Show Details</Button>
          </Row>
          {showDtl ?
            <div>
              <Row className='cardbottom-row align-items-center mt-2'>
                <Col sm='8'>
                  <label>Estimated rewards earned per day</label>
                </Col>
                <Col sm='4' className='text-right'>
                  <div className="icon-text"><SvgIcon name='comdex-icon' /> 0.000000</div>
                  <div className="icon-text"><SvgIcon name='cmst-icon' /> 0.000000</div>
                </Col>
              </Row>
              <Row className='cardbottom-row align-items-center mt-2'>
                <Col sm='8'>
                  <label>CMDX/CMST LP Farmed</label>
                </Col>
                <Col sm='4' className='text-right'>
                  $50.000
                </Col>
              </Row>
              <Row className='cardbottom-row align-items-center mt-2'>
                <Col sm='8'>
                  <label>CMDX/ATOM LP Farmed <small>(Master Pool)</small></label>
                </Col>
                <Col sm='4' className='text-right'>
                  $150.000
                </Col>
              </Row>
            </div>
            :
            null
          }
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
