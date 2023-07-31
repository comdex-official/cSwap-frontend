import { Button, message, Slider, Tooltip } from 'antd';
import Long from 'long';
import * as PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  setFirstReserveCoinDenom,
  setPoolBalance,
  setSecondReserveCoinDenom,
  setUserLiquidityRefetch,
} from '../../../actions/liquidity';
import { setReverse } from '../../../actions/swap';
import Snack from '../../../shared/components/Snack';
import CustomInput from '../../../shared/components/CustomInput';
import RangeTooltipContent from '../../../shared/components/RangedToolTip';
import { comdex } from '../../../config/network';
import { ValidateInputNumber } from '../../../config/_validation';
import {
  APP_ID,
  DEFAULT_FEE,
  DOLLAR_DECIMALS,
  PRICE_DECIMALS,
} from '../../../constants/common';
import { signAndBroadcastTransaction } from '../../../services/helper';
import { defaultFee } from '../../../services/transaction';
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from '../../../utils/coin';
import {
  decimalConversion,
  getExponent,
  marketPrice,
  rangeToPercentage,
} from '../../../utils/number';
import { errorMessageMappingParser, toDecimals } from '../../../utils/string';
import variables from '../../../utils/variables';
import styles from '../Farm.module.scss';
import { NextImage } from '../../../shared/image/NextImage';
import PoolDetails from '../poolDetail';
import { Icon } from '../../../shared/image/Icon';
import { Toaster } from '../../../shared/components/toaster/Toaster';

const Deposit = ({
  theme,
  lang,
  address,
  pool,
  balances,
  reverse,
  setReverse,
  markets,
  refreshData,
  updateBalance,
  assetMap,
  iconList,
  refetch,
  setRefetch,
  setUserLiquidityRefetch,
  userLiquidityRefetch,
}) => {
  const marks = {
    0: Number(decimalConversion(pool?.minPrice)).toFixed(DOLLAR_DECIMALS),
    100: Number(decimalConversion(pool?.maxPrice)).toFixed(DOLLAR_DECIMALS),
  };

  const [firstInput, setFirstInput] = useState();
  const [secondInput, setSecondInput] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [depositProgress, setDepositProgress] = useState(false);
  const [farmProgress, setFarmProgress] = useState(false);
  const [inputValidationError, setInputValidationError] = useState();
  const [outputValidationError, setOutputValidationError] = useState();

  const normalPrice = decimalConversion(pool?.price);
  const userPoolTokens = getDenomBalance(balances, pool?.poolCoinDenom) || 0;

  let poolPrice =
    Number(normalPrice) /
    10 **
      Math.abs(
        getExponent(assetMap[pool?.balances?.baseCoin?.denom]?.decimals) -
          getExponent(assetMap[pool?.balances?.quoteCoin?.denom]?.decimals)
      );

  const firstAssetAvailableBalance =
    getDenomBalance(balances, pool?.balances?.baseCoin?.denom) || 0;

  const secondAssetAvailableBalance =
    getDenomBalance(balances, pool?.balances?.quoteCoin?.denom) || 0;

  const getOutputPrice = useCallback(() => {
    return reverse ? 1 / poolPrice : poolPrice; // calculating price from pool
  }, [poolPrice, reverse]);

  useEffect(() => {
    setReverse(false);
  }, [setReverse]);

  const getInputPrice = () => {
    return reverse ? poolPrice : 1 / poolPrice;
  };

  const resetValues = () => {
    setFirstInput();
    setSecondInput();
    setInputValidationError();
    setOutputValidationError();
  };

  const handleFirstInputChange = (value) => {
    value = toDecimals(
      value,
      assetMap[pool?.balances?.baseCoin?.denom]?.decimals
    )
      .toString()
      .trim();

    setInputValidationError(
      ValidateInputNumber(
        Number(
          getAmount(value, assetMap[pool?.balances?.baseCoin?.denom]?.decimals)
        ),
        firstAssetAvailableBalance,
        'macro'
      )
    );

    const numberOfTokens = (value * getOutputPrice()).toFixed(
      getExponent(assetMap[pool?.balances?.quoteCoin?.denom]?.decimals)
    );

    setFirstInput(value);

    setOutputValidationError(
      ValidateInputNumber(
        Number(
          getAmount(
            numberOfTokens,
            assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
          )
        ),
        secondAssetAvailableBalance,
        'macro'
      )
    );
    isFinite(Number(numberOfTokens)) && setSecondInput(numberOfTokens);
  };

  const handleSecondInputChange = (value) => {
    value = toDecimals(
      value,
      assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
    )
      .toString()
      .trim();

    setOutputValidationError(
      ValidateInputNumber(
        Number(
          getAmount(value, assetMap[pool?.balances?.quoteCoin?.denom]?.decimals)
        ),
        secondAssetAvailableBalance,
        'macro'
      )
    );

    const numberOfTokens = (value * getInputPrice()).toFixed(
      getExponent(assetMap[pool?.balances?.baseCoin?.denom]?.decimals)
    );

    setSecondInput(value);

    setInputValidationError(
      ValidateInputNumber(
        Number(
          getAmount(
            numberOfTokens,
            assetMap[pool?.balances?.baseCoin?.denom]?.decimals
          )
        ),
        firstAssetAvailableBalance,
        'macro'
      )
    );

    isFinite(Number(numberOfTokens)) && setFirstInput(numberOfTokens);
  };

  const handleDepositFarmClick = () => {
    setInProgress(true);

    const deposits = [
      {
        denom: pool?.balances?.baseCoin?.denom,
        amount: getAmount(
          firstInput,
          assetMap[pool?.balances?.baseCoin?.denom]?.decimals
        ),
      },
      {
        denom: pool?.balances?.quoteCoin?.denom,
        amount: getAmount(
          secondInput,
          assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
        ),
      },
    ];

    const sortedDepositCoins = deposits.sort((a, b) =>
      a.denom.localeCompare(b.denom)
    );

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: '/comdex.liquidity.v1beta1.MsgDepositAndFarm',
          value: {
            depositor: address.toString(),
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            depositCoins: sortedDepositCoins,
          },
        },
        fee: defaultFee(),
        memo: '',
      },
      address,
      (error, result) => {
        setInProgress(false);
        refreshData(pool);
        updateBalance();
        setRefetch(!refetch);
        setUserLiquidityRefetch(!userLiquidityRefetch);

        if (error) {
          message.error(error);
          return;
        }
        if (result?.code) {
          message.info(errorMessageMappingParser(result?.rawLog));
          return;
        }

        resetValues();

        message
          .loading('Processing..', 3)
          .then(() =>
            Toaster(
              <Snack
                message={variables[lang].tx_success}
                hash={result?.transactionHash}
              />
            )
          );
      }
    );
  };

  const handleDepositClick = () => {
    setDepositProgress(true);

    const deposits = [
      {
        denom: pool?.balances?.baseCoin?.denom,
        amount: getAmount(
          firstInput,
          assetMap[pool?.balances?.baseCoin?.denom]?.decimals
        ),
      },
      {
        denom: pool?.balances?.quoteCoin?.denom,
        amount: getAmount(
          secondInput,
          assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
        ),
      },
    ];

    const sortedDepositCoins = deposits.sort((a, b) =>
      a.denom.localeCompare(b.denom)
    );

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: '/comdex.liquidity.v1beta1.MsgDeposit',
          value: {
            depositor: address.toString(),
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            depositCoins: sortedDepositCoins,
          },
        },
        fee: defaultFee(),
        memo: '',
      },
      address,
      (error, result) => {
        setDepositProgress(false);
        refreshData(pool);
        updateBalance();
        setRefetch(!refetch);
        setUserLiquidityRefetch(!userLiquidityRefetch);

        if (error) {
          message.error(error);
          return;
        }
        if (result?.code) {
          message.info(errorMessageMappingParser(result?.rawLog));
          return;
        }

        resetValues();

        message
          .loading('Processing..', 3)
          .then(() =>
            Toaster(
              <Snack
                message={variables[lang].tx_success}
                hash={result?.transactionHash}
              />
            )
          );
      }
    );
  };

  const handleFarmClick = () => {
    setFarmProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: '/comdex.liquidity.v1beta1.MsgFarm',
          value: {
            farmer: address,
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            /** soft_lock_coin specifies coins to stake */
            farmingPoolCoin: {
              amount: Number(userPoolTokens).toFixed(0).toString(),
              denom: pool?.poolCoinDenom,
            },
          },
        },
        fee: defaultFee(),
        memo: '',
      },
      address,
      (error, result) => {
        setFarmProgress(false);
        refreshData(pool);
        updateBalance();
        setRefetch(!refetch);
        setUserLiquidityRefetch(!userLiquidityRefetch);

        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(errorMessageMappingParser(result?.rawLog));
          return;
        }

        message
          .loading('Processing..', 3)
          .then(() =>
            Toaster(
              <Snack
                message={variables[lang].tx_success}
                hash={result?.transactionHash}
              />
            )
          );
      }
    );
  };

  const showOfferCoinSpotPrice = () => {
    const denomIn = denomConversion(pool?.balances?.baseCoin?.denom);
    const denomOut = denomConversion(pool?.balances?.quoteCoin?.denom);
    const price = reverse ? 1 / poolPrice : poolPrice;

    return `1 ${denomIn || ''} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(comdex?.coinDecimals)} ${denomOut || ''}`;
  };

  const showDemandCoinSpotPrice = () => {
    const denomIn = denomConversion(pool?.balances?.baseCoin?.denom);
    const denomOut = denomConversion(pool?.balances?.quoteCoin?.denom);
    const price = reverse ? poolPrice : 1 / poolPrice;

    return `1 ${denomOut || ''} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(comdex?.coinDecimals)} ${denomIn || ''}`;
  };

  const handleFirstInputMax = (max) => {
    if (
      Number(
        getAmount(
          max * getOutputPrice(),
          assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
        )
      ) < Number(secondAssetAvailableBalance)
    ) {
      return handleFirstInputChange(max);
    } else {
      return handleSecondInputChange(
        amountConversion(
          secondAssetAvailableBalance,
          assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
        )
      );
    }
  };

  const handleSecondInputMax = (max) => {
    if (
      Number(
        getAmount(
          max * getInputPrice(),
          assetMap[pool?.balances?.baseCoin?.denom]?.decimals
        )
      ) < Number(firstAssetAvailableBalance)
    ) {
      return handleSecondInputChange(max);
    } else {
      return handleFirstInputChange(
        amountConversion(
          firstAssetAvailableBalance,
          assetMap[pool?.balances?.baseCoin?.denom]?.decimals
        )
      );
    }
  };

  const showFirstCoinValue = useCallback(() => {
    const total =
      marketPrice(markets, pool?.balances?.baseCoin?.denom) * firstInput;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  }, [markets, firstInput, pool?.balances?.baseCoin?.denom]);

  const showSecondCoinValue = useCallback(() => {
    const total =
      marketPrice(markets, pool?.balances?.quoteCoin?.denom) * secondInput;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  }, [markets, secondInput, pool?.balances?.quoteCoin?.denom]);

  return (
    <>
      <div className="ranged-box">
        <div className="ranged-box-inner">
          {pool?.type === 2 ? (
            <div className="farm-rang-slider">
              <div className="farmrange-title">
                {Number(pool?.price) > Number(pool?.minPrice) &&
                Number(pool?.price) < Number(pool?.maxPrice) ? (
                  <span className="success-color2">In range</span>
                ) : (
                  <span className="warn-color2">Out of range</span>
                )}
                <Tooltip
                  overlayClassName="ranged-tooltip"
                  title={
                    <RangeTooltipContent
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
                  }
                  placement="bottom"
                  autoAdjustOverflow={false}
                >
                  <>
                    <Icon className={'bi bi-info-circle'} />
                  </>
                </Tooltip>
              </div>
              <div className="ranged">
                <Slider
                  className="farm-slider farm-slider-small"
                  tooltip={{ open: false }}
                  value={rangeToPercentage(
                    Number(decimalConversion(pool?.minPrice)),
                    Number(decimalConversion(pool?.maxPrice)),
                    Number(decimalConversion(pool?.price))
                  )}
                  marks={marks}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.tradeCard__body__item}>
        <div className={styles.tradeCard__body__left}>
          <div className={styles.tradeCard__body__main}>
            <div
              className={`${styles.tradeCard__body__left__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {`Provide ${denomConversion(pool?.balances?.baseCoin?.denom)}`}
            </div>

            <div className={styles.tradeCard__body__right__el1}>
              <div className="maxhalf">
                <Button
                  className="active"
                  onClick={() =>
                    handleFirstInputMax(
                      pool?.balances?.baseCoin?.denom ===
                        comdex?.coinMinimalDenom &&
                        Number(firstAssetAvailableBalance) > DEFAULT_FEE
                        ? amountConversion(
                            firstAssetAvailableBalance - DEFAULT_FEE,
                            assetMap[pool?.balances?.baseCoin?.denom]?.decimals
                          )
                        : amountConversion(
                            firstAssetAvailableBalance,
                            assetMap[pool?.balances?.baseCoin?.denom]?.decimals
                          )
                    )
                  }
                >
                  MAX
                </Button>
              </div>
              <div
                className={`${styles.tradeCard__body__right__el1__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <span>
                  {amountConversionWithComma(
                    firstAssetAvailableBalance,
                    assetMap[pool?.balances?.baseCoin?.denom]?.decimals
                  )}{' '}
                  {denomConversion(pool?.balances?.baseCoin?.denom)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.tradeCard__body__right}>
            <div
              className={`${styles.tradeCard__body__left__item__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div className={`${styles.tradeCard__logo__wrap}`}>
                <div className={`${styles.tradeCard__logo}`}>
                  <NextImage
                    src={
                      iconList?.[pool?.balances?.baseCoin?.denom]?.coinImageUrl
                    }
                    width={50}
                    height={50}
                    alt="Logo_Dark"
                  />
                </div>
              </div>

              <div
                className={`${
                  styles.tradeCard__body__left__item__details__title
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {denomConversion(pool?.balances?.baseCoin?.denom)}
              </div>
            </div>

            <div>
              <CustomInput
                value={firstInput}
                onChange={(event) => handleFirstInputChange(event.target.value)}
                validationError={inputValidationError}
              />
              <div
                className={`${styles.tradeCard__body__right__el3} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {pool?.id && showFirstCoinValue()}
              </div>
              <div
                className={`${styles.tradeCard__body__right__el4} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {pool?.id && showOfferCoinSpotPrice()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tradeCard__body__item}>
        <div className={styles.tradeCard__body__left}>
          <div className={styles.tradeCard__body__main}>
            <div
              className={`${styles.tradeCard__body__left__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {`Provide ${denomConversion(pool?.balances?.quoteCoin?.denom)}`}
            </div>

            <div className={styles.tradeCard__body__right__el1}>
              <div className="maxhalf">
                <Button
                  className="active"
                  onClick={() =>
                    handleSecondInputMax(
                      pool?.balances?.quoteCoin?.denom === comdex?.coinDenom &&
                        Number(secondAssetAvailableBalance) > DEFAULT_FEE
                        ? amountConversion(
                            secondAssetAvailableBalance - DEFAULT_FEE,
                            assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
                          )
                        : amountConversion(
                            secondAssetAvailableBalance,
                            assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
                          )
                    )
                  }
                >
                  MAX
                </Button>
              </div>
              <div
                className={`${styles.tradeCard__body__right__el1__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <span className="">
                  {amountConversionWithComma(
                    secondAssetAvailableBalance,
                    assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
                  )}{' '}
                  {denomConversion(pool?.balances?.quoteCoin?.denom)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.tradeCard__body__right}>
            <div
              className={`${styles.tradeCard__body__left__item__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div className={`${styles.tradeCard__logo__wrap}`}>
                <div className={`${styles.tradeCard__logo}`}>
                  <NextImage
                    src={
                      iconList?.[pool?.balances?.quoteCoin?.denom]?.coinImageUrl
                    }
                    width={50}
                    height={50}
                    alt="Logo_Dark"
                  />
                </div>
              </div>

              <div
                className={`${
                  styles.tradeCard__body__left__item__details__title
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {denomConversion(pool?.balances?.quoteCoin?.denom)}
              </div>
            </div>

            <div>
              <CustomInput
                value={secondInput}
                onChange={(event) =>
                  handleSecondInputChange(event.target.value)
                }
                validationError={outputValidationError}
              />
              <div
                className={`${styles.tradeCard__body__right__el3} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {pool?.id && showSecondCoinValue()}
              </div>
              <div
                className={`${styles.tradeCard__body__right__el4} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {pool?.id && showDemandCoinSpotPrice()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PoolDetails pool={pool} />

      <div className={styles.farm__deposit__buttonWrap}>
        <Button
          type="primary"
          className="btn-filled2 btn-width-fixed"
          loading={depositProgress}
          disabled={
            depositProgress ||
            !pool?.id ||
            !Number(firstInput) ||
            !Number(secondInput) ||
            inputValidationError?.message ||
            outputValidationError?.message
          }
          onClick={() => handleDepositClick()}
        >
          Deposit
        </Button>
        <Button
          type="primary"
          className="btn-filled2 btn-width-fixed"
          loading={farmProgress}
          disabled={!userPoolTokens || farmProgress}
          onClick={() => handleFarmClick()}
        >
          Farm
        </Button>
        <Button
          type="primary"
          className="btn-filled2 btn-width-fixed"
          loading={inProgress}
          disabled={
            inProgress ||
            !pool?.id ||
            !Number(firstInput) ||
            !Number(secondInput) ||
            inputValidationError?.message ||
            outputValidationError?.message
          }
          onClick={() => handleDepositFarmClick()}
        >
          Deposit & Farm
        </Button>
      </div>
    </>
  );
};

Deposit.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshData: PropTypes.func.isRequired,
  setFirstReserveCoinDenom: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setReverse: PropTypes.func.isRequired,
  setSecondReserveCoinDenom: PropTypes.func.isRequired,
  updateBalance: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  firstReserveCoinDenom: PropTypes.string,
  markets: PropTypes.object,
  pair: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    baseCoinDenom: PropTypes.string,
    quoteCoinDenom: PropTypes.string,
  }),
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
  }),
  poolBalance: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    })
  ),
  pools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      reserveAccountAddress: PropTypes.string,
      poolCoinDenom: PropTypes.string,
      reserveCoinDenoms: PropTypes.array,
    })
  ),
  reverse: PropTypes.bool,
  secondReserveCoinDenom: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    pools: state.liquidity.pool.list,
    address: state.account.address,
    reverse: state.swap.reverse,
    markets: state.oracle.market.list,
    balances: state.account.balances.list,
    firstReserveCoinDenom: state.liquidity.firstReserveCoinDenom,
    secondReserveCoinDenom: state.liquidity.secondReserveCoinDenom,
    pair: state.asset.pair,
    poolBalance: state.liquidity.poolBalance,
    assetMap: state.asset.map,
    iconList: state.config?.iconList,
    userLiquidityRefetch: state.liquidity.userLiquidityRefetch,
  };
};

const actionsToProps = {
  setPoolBalance,
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setReverse,
  setUserLiquidityRefetch,
};

export default connect(stateToProps, actionsToProps)(Deposit);
