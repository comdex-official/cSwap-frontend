import { Button, message, Slider, Tooltip } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  setFirstReserveCoinDenom,
  setPool,
  setPoolBalance,
  setSecondReserveCoinDenom
} from "../../../../actions/liquidity";
import { setReverse } from "../../../../actions/swap";
import { Row, SvgIcon } from "../../../../components/common";
import Snack from "../../../../components/common/Snack";
import CustomInput from "../../../../components/CustomInput";
import RangeTooltipContent from "../../../../components/RangedToolTip";
import { comdex } from "../../../../config/network";
import { ValidateInputNumber } from "../../../../config/_validation";
import {
  APP_ID,
  DEFAULT_FEE,
  DOLLAR_DECIMALS,
  PRICE_DECIMALS
} from "../../../../constants/common";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { defaultFee } from "../../../../services/transaction";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance
} from "../../../../utils/coin";
import {
  decimalConversion,
  getExponent,
  marketPrice,
  rangeToPercentage
} from "../../../../utils/number";
import { iconNameFromDenom, toDecimals } from "../../../../utils/string";
import variables from "../../../../utils/variables";
import Info from "../../Info";

const Deposit = ({
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
}) => {
  const marks = {
    0: Number(decimalConversion(pool?.minPrice)).toFixed(DOLLAR_DECIMALS),
    100: Number(decimalConversion(pool?.maxPrice)).toFixed(DOLLAR_DECIMALS),
  };

  const [firstInput, setFirstInput] = useState();
  const [secondInput, setSecondInput] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [inputValidationError, setInputValidationError] = useState();
  const [outputValidationError, setOutputValidationError] = useState();

  const normalPrice = decimalConversion(pool?.price);

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
        "macro"
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
        "macro"
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
        "macro"
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
        "macro"
      )
    );

    isFinite(Number(numberOfTokens)) && setFirstInput(numberOfTokens);
  };

  const handleClick = () => {
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
          typeUrl: "/comdex.liquidity.v1beta1.MsgDeposit",
          value: {
            depositor: address.toString(),
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            depositCoins: sortedDepositCoins,
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        refreshData();
        updateBalance();
        if (error) {
          message.error(error);
          return;
        }
        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        resetValues();
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

  const showOfferCoinSpotPrice = () => {
    const denomIn = denomConversion(pool?.balances?.baseCoin?.denom);
    const denomOut = denomConversion(pool?.balances?.quoteCoin?.denom);
    const price = reverse ? 1 / poolPrice : poolPrice;

    return `1 ${denomIn || ""} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(comdex?.coinDecimals)} ${denomOut || ""}`;
  };

  const showDemandCoinSpotPrice = () => {
    const denomIn = denomConversion(pool?.balances?.baseCoin?.denom);
    const denomOut = denomConversion(pool?.balances?.quoteCoin?.denom);
    const price = reverse ? poolPrice : 1 / poolPrice;

    return `1 ${denomOut || ""} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(comdex?.coinDecimals)} ${denomIn || ""}`;
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
    <div className="common-card">
      <div className="farm-content-card">
        {pool?.type === 2 ? (
          <div className="farm-rang-slider">
            <div className="farmrange-title">
              {Number(pool?.price) > Number(pool?.minPrice) &&
              Number(pool?.price) < Number(pool?.maxPrice)
                ? "In range"
                : "Out of range"}
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
              >
                <SvgIcon name="info-icon" viewbox="0 0 9 9" />
              </Tooltip>
            </div>
            <Slider
              className="farm-slider"
              tooltip={{ open: false, prefixCls: "ant-tooltip-open" }}
              value={rangeToPercentage(
                Number(decimalConversion(pool?.minPrice)),
                Number(decimalConversion(pool?.maxPrice)),
                Number(decimalConversion(pool?.price))
              )}
              marks={marks}
            />
          </div>
        ) : null}
        <div className="assets-select-card mb-3">
          <div className="assets-left">
            <label className="leftlabel">
              {variables[lang].provide}{" "}
              {denomConversion(pool?.balances?.baseCoin?.denom)}
            </label>
            <div className="assets-select-wrapper">
              {/* Icon Container Start  */}
              <div className="farm-asset-icon-container">
                <div className="select-inner">
                  <div className="svg-icon">
                    <div className="svg-icon-inner">
                      <SvgIcon
                        name={iconNameFromDenom(
                          pool?.balances?.baseCoin?.denom
                        )}
                      />
                    </div>
                  </div>
                  <div className="name">
                    {denomConversion(pool?.balances?.baseCoin?.denom)}
                  </div>
                </div>
              </div>
              {/* Icon Container End  */}
            </div>
          </div>
          <div className="assets-right">
            <div className="label-right">
              {variables[lang].available}{" "}
              <span className="ml-1">
                {" "}
                {amountConversionWithComma(
                  firstAssetAvailableBalance,
                  assetMap[pool?.balances?.baseCoin?.denom]?.decimals
                )}{" "}
                {denomConversion(pool?.balances?.baseCoin?.denom)}
              </span>
              <div className="maxhalf">
                <Button
                  className="active"
                  onClick={() =>
                    handleFirstInputMax(
                      pool?.balances?.baseCoin?.denom === comdex?.coinMinimalDenom &&
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
                  {variables[lang].max}
                </Button>
              </div>
            </div>
            <div className="input-select">
              <CustomInput
                value={firstInput}
                onChange={(event) => handleFirstInputChange(event.target.value)}
                validationError={inputValidationError}
              />
              <small>{pool?.id && showFirstCoinValue()}</small>
              <small>{pool?.id && showOfferCoinSpotPrice()}</small>
            </div>
          </div>
        </div>
        <div className="assets-select-card mb-3">
          <div className="assets-left">
            <label className="leftlabel">
              {variables[lang].provide}{" "}
              {denomConversion(pool?.balances?.quoteCoin?.denom)}{" "}
            </label>
            <div className="assets-select-wrapper">
              {/* Icon Container Start */}
              <div className="farm-asset-icon-container">
                <div className="select-inner">
                  <div className="svg-icon">
                    <div className="svg-icon-inner">
                      <SvgIcon
                        name={iconNameFromDenom(
                          pool?.balances?.quoteCoin?.denom
                        )}
                      />
                    </div>
                  </div>
                  <div className="name">
                    {denomConversion(pool?.balances?.quoteCoin?.denom)}
                  </div>
                </div>
              </div>
              {/* Icon Container End  */}
            </div>
          </div>
          <div className="assets-right">
            <div className="label-right">
              {variables[lang].available}{" "}
              <span className="ml-1">
                {amountConversionWithComma(
                  secondAssetAvailableBalance,
                  assetMap[pool?.balances?.quoteCoin?.denom]?.decimals
                )}{" "}
                {denomConversion(pool?.balances?.quoteCoin?.denom)}
              </span>
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
                  {variables[lang].max}
                </Button>
              </div>
            </div>
            <div className="input-select">
              <CustomInput
                value={secondInput}
                onChange={(event) =>
                  handleSecondInputChange(event.target.value)
                }
                validationError={outputValidationError}
              />
              <small>{pool?.id && showSecondCoinValue()}</small>
              <small>{pool?.id && showDemandCoinSpotPrice()}</small>
            </div>
          </div>
        </div>
        <Row className="pool_balance p-1">
          <Info />
        </Row>
        <div className="assets PoolSelect-btn">
          <div className="assets-form-btn text-center  mb-2">
            <Button
              loading={inProgress}
              disabled={
                inProgress ||
                !pool?.id ||
                !Number(firstInput) ||
                !Number(secondInput) ||
                inputValidationError?.message ||
                outputValidationError?.message
              }
              type="primary"
              className="btn-filled"
              onClick={() => handleClick()}
            >
              Add Liquidity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

Deposit.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshData: PropTypes.func.isRequired,
  setFirstReserveCoinDenom: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setPool: PropTypes.func.isRequired,
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
    pool: state.liquidity.pool._,
    address: state.account.address,
    reverse: state.swap.reverse,
    markets: state.oracle.market.list,
    balances: state.account.balances.list,
    firstReserveCoinDenom: state.liquidity.firstReserveCoinDenom,
    secondReserveCoinDenom: state.liquidity.secondReserveCoinDenom,
    pair: state.asset.pair,
    poolBalance: state.liquidity.poolBalance,
    assetMap: state.asset.map,
  };
};

const actionsToProps = {
  setPoolBalance,
  setPool,
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setReverse,
};

export default connect(stateToProps, actionsToProps)(Deposit);
