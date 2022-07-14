import React, { useEffect, useState } from "react";
import variables from "../../../../utils/variables";
import { SvgIcon } from "../../../../components/common";
import { Button, message } from "antd";
import CustomInput from "../../../../components/CustomInput";
import Info from "../../Info";
import * as PropTypes from "prop-types";
import {
  setFirstReserveCoinDenom,
  setPool,
  setPoolBalance,
  setSecondReserveCoinDenom,
  setSpotPrice,
} from "../../../../actions/liquidity";
import { setComplete, setReverse } from "../../../../actions/swap";
import { connect } from "react-redux";
import { comdex } from "../../../../config/network";
import { ValidateInputNumber } from "../../../../config/_validation";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from "../../../../utils/coin";
import { iconNameFromDenom, toDecimals } from "../../../../utils/string";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import Long from "long";
import {
  APP_ID,
  DEFAULT_FEE,
  DOLLAR_DECIMALS,
} from "../../../../constants/common";
import { defaultFee } from "../../../../services/transaction";
import Snack from "../../../../components/common/Snack";
import { marketPrice } from "../../../../utils/number";
import { Row } from "../../../../components/common";

const Deposit = ({
  lang,
  address,
  pool,
  setSpotPrice,
  spotPrice,
  balances,
  reverse,
  setReverse,
  markets,
  setComplete,
  pair,
  refreshData,
  updateBalance,
  poolPriceMap,
}) => {
  const [firstInput, setFirstInput] = useState();
  const [secondInput, setSecondInput] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [inputValidationError, setInputValidationError] = useState();
  const [outputValidationError, setOutputValidationError] = useState();

  useEffect(() => {
    setComplete(false);
    setReverse(false);
  }, []);

  useEffect(() => {
    const poolBalance = pool?.balances;
    if (poolBalance?.length > 0) {
      const exactInAsset =
        poolBalance && poolBalance[0] && poolBalance[0].denom;

      const spotPrice =
        (poolBalance && poolBalance[0] && poolBalance[0].amount) /
        (poolBalance && poolBalance[1] && poolBalance[1].amount);

      setSpotPrice(
        exactInAsset === comdex.coinMinimalDenom
          ? spotPrice.toFixed(6)
          : (1 / spotPrice).toFixed(6)
      );
    }
  }, [pool]);

  useEffect(() => {
    if (firstInput) {
      const numberOfTokens = (firstInput * getOutputPrice()).toFixed(6);

      setOutputValidationError(
        ValidateInputNumber(
          Number(getAmount(numberOfTokens)),
          secondAssetAvailableBalance,
          "macro"
        )
      );

      isFinite(Number(numberOfTokens)) && setSecondInput(numberOfTokens);
    }
  }, [spotPrice]);

  const getOutputPrice = () => {
    return reverse ? spotPrice : 1 / spotPrice; // calculating price from pool
  };

  const getInputPrice = () => {
    return reverse ? 1 / spotPrice : spotPrice;
  };

  const resetValues = () => {
    setFirstInput();
    setSecondInput();
    setInputValidationError();
    setOutputValidationError();
  };

  const handleFirstInputChange = (value) => {
    value = toDecimals(value).toString().trim();

    setInputValidationError(
      ValidateInputNumber(
        Number(getAmount(value)),
        firstAssetAvailableBalance,
        "macro"
      )
    );

    const numberOfTokens = (value * getOutputPrice()).toFixed(6);

    setFirstInput(value);

    setOutputValidationError(
      ValidateInputNumber(
        Number(getAmount(numberOfTokens)),
        secondAssetAvailableBalance,
        "macro"
      )
    );
    isFinite(Number(numberOfTokens)) && setSecondInput(numberOfTokens);
  };

  const handleSecondInputChange = (value) => {
    value = toDecimals(value).toString().trim();

    setOutputValidationError(
      ValidateInputNumber(
        Number(getAmount(value)),
        secondAssetAvailableBalance,
        "macro"
      )
    );

    const numberOfTokens = (value * getInputPrice()).toFixed(6);

    setSecondInput(value);

    setInputValidationError(
      ValidateInputNumber(
        Number(getAmount(numberOfTokens)),
        firstAssetAvailableBalance,
        "macro"
      )
    );

    isFinite(Number(numberOfTokens)) && setFirstInput(numberOfTokens);
  };

  const firstAssetAvailableBalance =
    getDenomBalance(balances, pair?.baseCoinDenom) || 0;

  const secondAssetAvailableBalance =
    getDenomBalance(balances, pair?.quoteCoinDenom) || 0;

  const handleClick = () => {
    setInProgress(true);

    const deposits = [
      {
        denom: pair?.baseCoinDenom,
        amount: getAmount(firstInput),
      },
      {
        denom: pair?.quoteCoinDenom,
        amount: getAmount(secondInput),
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

        setComplete(true);
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
    const denomIn = denomConversion(pair?.baseCoinDenom);
    const denomOut = denomConversion(pair?.quoteCoinDenom);
    const price = reverse ? spotPrice : 1 / spotPrice;

    return `1 ${denomIn || ""} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(6)} ${denomOut || ""}`;
  };

  const showDemandCoinSpotPrice = () => {
    const denomIn = denomConversion(pair?.baseCoinDenom);
    const denomOut = denomConversion(pair?.quoteCoinDenom);
    const price = reverse ? 1 / spotPrice : spotPrice;

    return `1 ${denomOut || ""} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(6)} ${denomIn || ""}`;
  };

  const handleFirstInputMax = (max) => {
    if (
      Number(getAmount((max * getOutputPrice()).toFixed(6))) <
      Number(secondAssetAvailableBalance)
    ) {
      return handleFirstInputChange(max);
    } else {
      return handleSecondInputChange(
        amountConversion(secondAssetAvailableBalance)
      );
    }
  };

  const handleSecondInputMax = (max) => {
    if (
      Number(getAmount((max * getInputPrice()).toFixed(6))) <
      Number(firstAssetAvailableBalance)
    ) {
      return handleSecondInputChange(max);
    } else {
      return Number(firstAssetAvailableBalance) > DEFAULT_FEE
        ? handleFirstInputChange(
            amountConversion(firstAssetAvailableBalance - DEFAULT_FEE)
          )
        : handleFirstInputChange();
    }
  };

  const showFirstCoinValue = () => {
    const price = reverse ? spotPrice : 1 / spotPrice;
    const oralcePrice =
      poolPriceMap[pair?.quoteCoinDenom] ||
      marketPrice(markets, pair?.quoteCoinDenom);
    const total = price * oralcePrice * firstInput;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  const showSecondCoinValue = () => {
    const price = reverse ? 1 / spotPrice : spotPrice;
    const oralcePrice =
      poolPriceMap[pair?.baseCoinDenom] ||
      marketPrice(markets, pair?.baseCoinDenom);
    const total = price * oralcePrice * secondInput;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  return (
    <div className="common-card">
      <div className="farm-content-card">
        <div className="assets-select-card">
          <div className="assets-left">
            <label className="leftlabel">
              {variables[lang].provide} {denomConversion(pair?.baseCoinDenom)}
            </label>
            <div className="assets-select-wrapper">
              {/* Icon Container Start  */}
              <div className="farm-asset-icon-container">
                <div className="select-inner">
                  <div className="svg-icon">
                    <div className="svg-icon-inner">
                      <SvgIcon name={iconNameFromDenom(pair?.baseCoinDenom)} />
                    </div>
                  </div>
                  <div className="name">
                    {denomConversion(pair?.baseCoinDenom)}
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
                {amountConversionWithComma(firstAssetAvailableBalance)}{" "}
                {denomConversion(pair?.baseCoinDenom)}
              </span>
              <div className="maxhalf">
                <Button
                  className="active"
                  onClick={() =>
                    handleFirstInputMax(
                      Number(firstAssetAvailableBalance) > DEFAULT_FEE
                        ? amountConversion(
                            firstAssetAvailableBalance - DEFAULT_FEE
                          )
                        : null
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
              {variables[lang].provide} {denomConversion(pair?.quoteCoinDenom)}{" "}
            </label>
            <div className="assets-select-wrapper">
              {/* Icon Container Start */}
              <div className="farm-asset-icon-container">
                <div className="select-inner">
                  <div className="svg-icon">
                    <div className="svg-icon-inner">
                      <SvgIcon name={iconNameFromDenom(pair?.quoteCoinDenom)} />
                    </div>
                  </div>
                  <div className="name">
                    {denomConversion(pair?.quoteCoinDenom)}
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
                {amountConversionWithComma(secondAssetAvailableBalance)}{" "}
                {denomConversion(pair?.quoteCoinDenom)}
              </span>
              <div className="maxhalf">
                <Button
                  className="active"
                  onClick={() =>
                    handleSecondInputMax(
                      amountConversion(secondAssetAvailableBalance)
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
  setComplete: PropTypes.func.isRequired,
  setFirstReserveCoinDenom: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setPool: PropTypes.func.isRequired,
  setReverse: PropTypes.func.isRequired,
  setSecondReserveCoinDenom: PropTypes.func.isRequired,
  setSpotPrice: PropTypes.func.isRequired,
  updateBalance: PropTypes.func.isRequired,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  firstReserveCoinDenom: PropTypes.string,
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
  poolPriceMap: PropTypes.object,
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
    spotPrice: state.liquidity.spotPrice,
    balances: state.account.balances.list,
    firstReserveCoinDenom: state.liquidity.firstReserveCoinDenom,
    secondReserveCoinDenom: state.liquidity.secondReserveCoinDenom,
    pair: state.asset.pair,
    poolBalance: state.liquidity.poolBalance,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

const actionsToProps = {
  setPoolBalance,
  setPool,
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setComplete,
  setSpotPrice,
  setReverse,
};

export default connect(stateToProps, actionsToProps)(Deposit);
