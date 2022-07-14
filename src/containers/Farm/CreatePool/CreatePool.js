import React, { useEffect, useState } from "react";
import "./index.scss";
import { Modal, Button } from "antd";
import { Col, Row, SvgIcon } from "../../../components/common";
import CustomSelect from "../../../components/CustomSelect";
import CustomInput from "../../../components/CustomInput";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from "../../../utils/coin";
import {
  iconNameFromDenom,
  toDecimals,
  uniqueLiquidityPairDenoms,
  uniqueQuoteDenomsForBase,
} from "../../../utils/string";
import { Steps, message } from "antd";
import { Checkbox } from "antd";
import * as PropTypes from "prop-types";
import { setPoolTokenSupply } from "../../../actions/liquidity";
import { connect } from "react-redux";
import {
  APP_ID,
  DEFAULT_FEE,
  DOLLAR_DECIMALS,
} from "../../../constants/common";
import {
  queryLiquidityPairs,
  queryLiquidityParams,
} from "../../../services/liquidity/query";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { defaultFee } from "../../../services/transaction";
import Snack from "../../../components/common/Snack";
import variables from "../../../utils/variables";
import { ValidateInputNumber } from "../../../config/_validation";
import { comdex } from "../../../config/network";
import Long from "long";

const CreatePoolModal = ({
  openPoolModal,
  closePool,
  balances,
  address,
  refreshData,
  refreshBalance,
  markets,
  lang,
}) => {
  const [current, setCurrent] = useState(0);
  const [baseToken, setBaseToken] = useState();
  const [quoteToken, setQuoteToken] = useState();
  const [baseAmount, setBaseAmount] = useState();
  const [quoteAmount, setQuoteAmount] = useState();
  const [swapFeePercentage, setSwapFeePercentage] = useState();
  const [isAccepted, setAccepted] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [liquidityPairs, setLiquidityPairs] = useState();
  const [liquidityParams, setLiquidityParams] = useState();
  const [baseAmountValidationError, setBaseAmountValidationError] = useState();
  const [quoteAmountValidationError, setQuoteAmountValidationError] =
    useState();
  const [swapFeeValidationError, setSwapFeeValidationError] = useState();

  const BASE_PERCENTAGE = 50;
  const QUOTE_PERCENTAGE = 50;

  const baseAvailable = getDenomBalance(balances, baseToken);
  const quoteAvailable = getDenomBalance(balances, quoteToken);

  useEffect(() => {
    queryLiquidityPairs((error, result) => {
      if (error) {
        return;
      }
      setLiquidityPairs(result?.pairs);
    });

    queryLiquidityParams((error, result) => {
      if (error) {
        return;
      }
      setLiquidityParams(result.params);
    });
    resetValues();
  }, []);

  const resetValues = () => {
    setCurrent(0);
    setBaseToken();
    setQuoteToken();
    setBaseAmount();
    setQuoteAmount();
    setSwapFeePercentage();
    setAccepted(false);
  };

  const { Step } = Steps;

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const onCheckChange = (event) => {
    setAccepted(event.target.checked);
  };

  const handleBaseTokenChange = (value) => {
    setBaseToken(value);
  };

  const handleQuoteTokenChange = (value) => {
    setQuoteToken(value);
  };

  const handleBaseAmountChange = (value) => {
    value = toDecimals(value)?.toString().trim();
    setBaseAmountValidationError(ValidateInputNumber(Number(getAmount(value))));
    setBaseAmount(value);
  };

  const handleQuoteAmountChange = (value) => {
    value = toDecimals(value).toString().trim();
    setQuoteAmount(value);
    setQuoteAmountValidationError(
      ValidateInputNumber(Number(getAmount(value)))
    );
  };

  const handleSwapPercentageChange = (value) => {
    value = toDecimals(value).toString().trim();
    setSwapFeePercentage(value);
    setSwapFeeValidationError(ValidateInputNumber(Number(value)));
  };

  const handleCreate = () => {
    const selectedPair = liquidityPairs?.filter(
      (item) =>
        (item.baseCoinDenom === baseToken &&
          item.quoteCoinDenom === quoteToken) ||
        (item.baseCoinDenom === baseToken && item.quoteCoinDenom === quoteToken)
    )[0];

    if (selectedPair?.id) {
      setInProgress(true);

      const deposits = [
        {
          denom: baseToken,
          amount: getAmount(baseAmount),
        },
        {
          denom: quoteToken,
          amount: getAmount(quoteAmount),
        },
      ];

      const sortedDepositCoins = deposits.sort((a, b) =>
        a.denom.localeCompare(b.denom)
      );

      signAndBroadcastTransaction(
        {
          message: {
            typeUrl: "/comdex.liquidity.v1beta1.MsgCreatePool",
            value: {
              creator: address.toString(),
              appId: Long.fromNumber(APP_ID),
              pairId: selectedPair?.id,
              depositCoins: sortedDepositCoins,
            },
          },
          fee: defaultFee(),
          memo: "",
        },
        address,
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            return;
          }
          if (result?.code) {
            message.info(result?.rawLog);
            return;
          }

          refreshData();
          refreshBalance();
          resetValues();
          message.success(
            <Snack
              message={variables[lang].tx_success}
              hash={result?.transactionHash}
            />
          );
        }
      );
    } else {
      message.info("No pair exists");
    }
  };

  const handleBaseInputMax = () => {
    if (Number(baseAvailable)) {
      const max =
        baseToken === comdex.coinMinimalDenom
          ? Number(baseAvailable) > DEFAULT_FEE
            ? baseAvailable - DEFAULT_FEE
            : null
          : baseAvailable;

      return handleBaseAmountChange(amountConversion(max));
    }
  };

  const handleQuoteInputMax = () => {
    if (Number(quoteAvailable)) {
      const max =
        quoteToken === comdex.coinMinimalDenom
          ? Number(quoteAvailable) > DEFAULT_FEE
            ? quoteAvailable - DEFAULT_FEE
            : null
          : quoteAvailable;

      return handleQuoteAmountChange(amountConversion(max));
    }
  };

  const inputOptions = uniqueLiquidityPairDenoms(liquidityPairs, "in");
  const outputOptions = uniqueQuoteDenomsForBase(
    liquidityPairs,
    "in",
    baseToken
  );

  const disableConditions =
    (current === 0 && (!baseToken || !quoteToken)) ||
    (current === 1 && (!baseAmount || !quoteAmount)) ||
    baseAmountValidationError?.message ||
    quoteAmountValidationError?.message;

  const steps = [
    {
      title: "",
      content: (
        <>
          <div className="pool-asset-first-container mt-4">
            <div className="assets-select-card">
              <div className="assets-left">
                <div className="assets-select-wrapper">
                  <CustomSelect
                    onChange={handleBaseTokenChange}
                    list={inputOptions.length > 0 ? inputOptions : null}
                    value={baseToken || null}
                  />
                </div>
              </div>
              <div className="assets-right">
                <div className="input-select">
                  <CustomInput
                    decimals={DOLLAR_DECIMALS}
                    value={BASE_PERCENTAGE}
                    disabled
                    className="assets-select-input with-select"
                  />
                  <span className="percentage ml-1">%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pool-asset-second-container mt-3">
            <div className="assets-select-card">
              <div className="assets-left">
                <div className="assets-select-wrapper">
                  <CustomSelect
                    onChange={handleQuoteTokenChange}
                    list={outputOptions.length > 0 ? outputOptions : null}
                    value={quoteToken || null}
                  />
                </div>
              </div>
              <div className="assets-right">
                <div className="input-select">
                  <CustomInput
                    disabled
                    decimals={DOLLAR_DECIMALS}
                    value={QUOTE_PERCENTAGE}
                    className="assets-select-input with-select"
                  />
                  <span className="percentage ml-1">%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "",
      content: (
        <>
          <div className="pool-asset-first-container mt-3">
            <div className="assets-select-card">
              <div className="assets-left">
                <div className="assets-select-wrapper">
                  <Row>
                    <div className="cswap-head">
                      <div className="header-left circle-icon">
                        <div className="icon-circle">
                          <div className="svg-icon-inner">
                            <SvgIcon
                              name={iconNameFromDenom(baseToken)}
                              viewbox="0 0 26.229 14"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Col>
                      <div className="pool-denom">
                        {denomConversion(baseToken)}
                      </div>
                      <div className="pool-denom">{BASE_PERCENTAGE}%</div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="assets-right">
                <div className="label-right">
                  Available
                  <span className="ml-1">
                    {amountConversionWithComma(baseAvailable || 0)}{" "}
                    {denomConversion(baseToken)}
                  </span>{" "}
                  <div className="maxhalf">
                    <Button
                      className="active"
                      onClick={() => handleBaseInputMax()}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                <div className="input-select validation-input-select">
                  <CustomInput
                    value={baseAmount}
                    validationError={baseAmountValidationError}
                    className="assets-select-input with-select"
                    onChange={(event) =>
                      handleBaseAmountChange(event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pool-asset-second-container mt-3">
            <div className="assets-select-card">
              <div className="assets-left">
                <div className="assets-select-wrapper ">
                  <Row>
                    <div className="cswap-head">
                      <div className="header-left circle-icon">
                        <div className="icon-circle">
                          <div className="svg-icon-inner">
                            <SvgIcon
                              name={iconNameFromDenom(quoteToken)}
                              viewbox="0 0 26.229 14"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Col>
                      <div className="pool-denom">
                        {denomConversion(quoteToken)}
                      </div>
                      <div className="pool-denom">{QUOTE_PERCENTAGE}%</div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="assets-right">
                <div className="label-right">
                  Available
                  <span className="ml-1">
                    {amountConversionWithComma(quoteAvailable || 0)}{" "}
                    {denomConversion(quoteToken)}
                  </span>{" "}
                  <div className="maxhalf">
                    <Button
                      className="active"
                      onClick={() => handleQuoteInputMax()}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                <div className="input-select validation-input-select">
                  <CustomInput
                    value={quoteAmount}
                    validationError={quoteAmountValidationError}
                    className="assets-select-input with-select"
                    onChange={(event) =>
                      handleQuoteAmountChange(event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "",
      content: (
        <>
          <div className="pool-asset-first-container mt-4">
            <div className="assets-select-card">
              <div className="assets-left">
                <div className="assets-select-wrapper">
                  <Row>
                    <div className="cswap-head">
                      <div className="header-left circle-icon">
                        <div className="icon-circle">
                          <div className="svg-icon-inner">
                            <SvgIcon
                              name={iconNameFromDenom(baseToken)}
                              viewbox="0 0 26.229 14"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Col>
                      <div className="pool-denom">
                        {denomConversion(baseToken)}
                      </div>
                      <div className="pool-denom">{BASE_PERCENTAGE}%</div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="assets-right">
                <div className="input-select">
                  <div className="selected-amount">{baseAmount}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="pool-asset-second-container mt-3">
            <div className="assets-select-card">
              <div className="assets-left">
                <div className="assets-select-wrapper ">
                  <Row>
                    <div className="cswap-head">
                      <div className="header-left circle-icon">
                        <div className="icon-circle">
                          <div className="svg-icon-inner">
                            <SvgIcon
                              name={iconNameFromDenom(quoteToken)}
                              viewbox="0 0 26.229 14"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Col>
                      <div className="pool-denom">
                        {" "}
                        {denomConversion(quoteToken)}
                      </div>
                      <div className="pool-denom">{QUOTE_PERCENTAGE}%</div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="assets-right">
                <div className="input-select">
                  <div className="selected-amount">{quoteAmount}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="swap-fee-container pool-asset-second-container mt-3">
            <div className="assets-select-card">
              <div className="assets-left">
                <div className="assets-select-wrapper ">
                  <Row>
                    <div className="cswap-head" />
                    <Col>
                      <div className="pool-denom">Swap Fee</div>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="assets-right">
                <div className="input-select">
                  <div className="selected-amount swap-fee-input-container input-select validation-input-select">
                    <CustomInput
                      decimals={DOLLAR_DECIMALS}
                      value={swapFeePercentage}
                      validationError={swapFeeValidationError}
                      className="assets-select-input with-select"
                      onChange={(event) =>
                        handleSwapPercentageChange(event.target.value)
                      }
                    />
                    <span className="ml-1 swap-percentage">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="checkbox-container mt-3 text-center ml-3">
            <Checkbox onChange={onCheckChange} checked={isAccepted}>
              <p>
                I understand that creating a new pool will cost{" "}
                {`${amountConversionWithComma(
                  liquidityParams?.poolCreationFee?.[0]?.amount
                )} 
              ${denomConversion(
                liquidityParams?.poolCreationFee?.[0]?.denom
              )}`}{" "}
              </p>{" "}
            </Checkbox>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Modal
        visible={openPoolModal}
        onOk={closePool}
        onCancel={closePool}
        footer={false}
        centered={true}
        className="create-pool-modal"
      >
        <h2 className="pool-denom">Create New Pool</h2>
        <Steps className="comdex-steps" current={current}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="pool-fee-container pool-asset-second-container mt-4">
          <div className="poolcreation-fee">
            <div className="poolcreationfee-inner">
              <div className="poolcreationfree-left">
                <div className="pool-denom">Pool Creation Fee</div>
                <p className="pool-paira">Transferred to community pool</p>
              </div>
              <div className="poolcreationfee-right">
                <span>
                  {amountConversionWithComma(
                    liquidityParams?.poolCreationFee?.[0]?.amount || 0
                  )}
                </span>
                <span className="ml-1">
                  {denomConversion(
                    liquidityParams?.poolCreationFee?.[0]?.denom
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action text-right mt-3">
          {current > 0 && (
            <Button
              style={{ margin: "0 8px" }}
              type="primary"
              onClick={() => prev()}
            >
              Previous
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button
              disabled={disableConditions}
              type="primary"
              onClick={() => next()}
            >
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              loading={inProgress}
              disabled={
                !swapFeePercentage ||
                swapFeePercentage > 100 ||
                !isAccepted ||
                swapFeeValidationError?.message
              }
              type="primary"
              onClick={() => handleCreate()}
            >
              Create
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};

CreatePoolModal.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshData: PropTypes.func.isRequired,
  refreshBalance: PropTypes.func.isRequired,
  address: PropTypes.string,
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
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
  };
};

const actionsToProps = {
  setPoolTokenSupply,
};

export default connect(stateToProps, actionsToProps)(CreatePoolModal);
