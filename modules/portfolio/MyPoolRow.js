import * as PropTypes from 'prop-types';
import React from 'react';
import { denomConversion } from '../../utils/coin';
import { NextImage } from '../../shared/image/NextImage';
import { connect } from 'react-redux';
import styles from './Portfolio.module.scss';
import { Tooltip } from 'antd';
import {
  Emission,
  HirborLogo,
  Pyramid,
  RangeGreen,
  RangeRed,
} from '../../shared/image';
import { commaSeparator, decimalConversion } from '../../utils/number';
import { PRICE_DECIMALS } from '../../constants/common';
import RangeTooltipContent from '../../shared/components/range/RangedToolTip';

const PoolCardRow = ({
  pool,
  iconList,
  calculateAPY,
  calculatePerDollorEmissioAmount,
  userLiquidityInPools,
  calculateVaultEmission,
  getMasterPool,
}) => {
  const theme = 'dark';
  return (
    <>
      <div
        className={`${styles.farmCard__element__wrap} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div className="assets-withicon">
          <div className="assets-icon assets-icon-1">
            <div
              className={`${styles.farmCard__element__left__logo} ${
                styles.first
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <NextImage
                  src={
                    iconList?.[pool?.balances?.baseCoin?.denom]?.coinImageUrl
                  }
                  width={35}
                  height={35}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="assets-icon assets-icon-2 ">
            <div
              className={`${styles.farmCard__element__left__logo} ${
                styles.first
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <NextImage
                  src={
                    iconList?.[pool?.balances?.quoteCoin?.denom]?.coinImageUrl
                  }
                  width={35}
                  height={35}
                  alt=""
                />
              </div>
            </div>
          </div>
          {denomConversion(pool?.balances?.baseCoin?.denom)}-
          {denomConversion(pool?.balances?.quoteCoin?.denom)}
        </div>
        <div
          className={`${styles.farmCard__element__right__wholetab} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          {(pool?.balances?.quoteCoin?.denom === 'ucmst' ||
            pool?.balances?.baseCoin?.denom === 'ucmst') && (
            <Tooltip
              title={'HARBOR emissions enabled'}
              overlayClassName="farm_upto_apr_tooltip"
            >
              <div
                className={`${styles.farmCard__element__right__emission} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <NextImage src={Emission} alt="Emission" />
              </div>
            </Tooltip>
          )}

          <div
            className={`${styles.farmCard__element__right} ${
              styles.tableActive
            } ${theme === 'dark' ? styles.dark : styles.light}`}
          >
            <div
              className={`${styles.farmCard__element__right__main} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {getMasterPool(Number(pool?.id)) ? (
                <div
                  className={`${styles.farmCard__element__right__pool} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.farmCard__element__right__pool__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <NextImage src={Pyramid} alt="Logo" />
                    {'Master Pool'}
                  </div>
                </div>
              ) : (
                ''
              )}

              {(pool?.balances?.quoteCoin?.denom === 'ucmst' ||
                pool?.balances?.baseCoin?.denom === 'ucmst') && (
                <div
                  className={`${styles.farmCard__element__apr__poll__wrap} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <Tooltip
                    title={
                      calculateAPY(
                        userLiquidityInPools[pool?.id],
                        Number(pool?.id)
                      ) ? (
                        <>
                          {`For every $1 of liquidity, you will receive `}
                          <span className="emission-amount">
                            {calculatePerDollorEmissioAmount(
                              Number(pool?.id),
                              userLiquidityInPools[pool?.id]
                            )}
                          </span>
                          <NextImage
                            src={iconList?.['uharbor']?.coinImageUrl}
                            alt={'logo'}
                            height={15}
                            width={15}
                          />
                          {` at the end of this week's emissions.`}
                        </>
                      ) : (
                        <>
                          {`Farm in CMST paired pools & receive these additional rewards at the end of this weeks HARBOR emissions.`}
                        </>
                      )
                    }
                    overlayClassName="farm_upto_apr_tooltip"
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__apr_pool__title
                      }  ${styles.boost} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <NextImage src={HirborLogo} alt="Logo" />
                      {pool?.id && calculateVaultEmission(pool?.id?.toNumber())
                        ? commaSeparator(
                            formatNumber(
                              calculateVaultEmission(pool?.id?.toNumber())
                            )
                          )
                        : Number(0).toFixed(2)}
                    </div>
                  </Tooltip>
                </div>
              )}

              {pool?.type === 2 ? (
                <div
                  className={`${styles.farmCard__element__right__basic} ${
                    Number(decimalConversion(pool?.price)).toFixed(
                      PRICE_DECIMALS
                    ) >
                      Number(decimalConversion(pool?.minPrice)).toFixed(
                        PRICE_DECIMALS
                      ) &&
                    Number(decimalConversion(pool?.price)).toFixed(
                      PRICE_DECIMALS
                    ) <
                      Number(decimalConversion(pool?.maxPrice)).toFixed(
                        PRICE_DECIMALS
                      )
                      ? styles.green
                      : styles.red
                  }`}
                >
                  <div className="ranged-box">
                    <div className="ranged-box-inner">
                      <Tooltip
                        overlayClassName="ranged-tooltip ranged-tooltip-small ranged"
                        title={
                          pool?.type === 2 ? (
                            <RangeTooltipContent
                              parent={'pool'}
                              price={Number(
                                decimalConversion(pool?.price)
                              ).toFixed(PRICE_DECIMALS)}
                              max={Number(
                                decimalConversion(pool?.maxPrice)
                              ).toFixed(PRICE_DECIMALS)}
                              min={Number(
                                decimalConversion(pool?.minPrice)
                              ).toFixed(PRICE_DECIMALS)}
                            />
                          ) : null
                        }
                        placement="top"
                      >
                        <div
                          className={`${
                            styles.farmCard__element__right__basic__title
                          } ${styles.active} ${
                            theme === 'dark' ? styles.dark : styles.light
                          }`}
                        >
                          {Number(decimalConversion(pool?.price)).toFixed(
                            PRICE_DECIMALS
                          ) >
                            Number(decimalConversion(pool?.minPrice)).toFixed(
                              PRICE_DECIMALS
                            ) &&
                          Number(decimalConversion(pool?.price)).toFixed(
                            PRICE_DECIMALS
                          ) <
                            Number(decimalConversion(pool?.maxPrice)).toFixed(
                              PRICE_DECIMALS
                            ) ? (
                            <NextImage src={RangeGreen} />
                          ) : (
                            <NextImage src={RangeRed} />
                          )}

                          {Number(decimalConversion(pool?.price)).toFixed(
                            PRICE_DECIMALS
                          ) >
                            Number(decimalConversion(pool?.minPrice)).toFixed(
                              PRICE_DECIMALS
                            ) &&
                          Number(decimalConversion(pool?.price)).toFixed(
                            PRICE_DECIMALS
                          ) <
                            Number(decimalConversion(pool?.maxPrice)).toFixed(
                              PRICE_DECIMALS
                            ) ? (
                            <div className="success-color">{'In Range'}</div>
                          ) : (
                            <div className="warn-color">{'Out of Range'}</div>
                          )}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ) : pool?.type === 1 ? (
                ''
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

PoolCardRow.propTypes = {
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
  iconList: PropTypes.object,
};
const stateToProps = (state) => {
  return {
    iconList: state.config?.iconList,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(PoolCardRow);
