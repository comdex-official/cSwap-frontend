import { Button, message, Popover, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { Col, Row, SvgIcon } from "../../components/common";
import CustomSwitch from "../../components/common/CustomSwitch";
import CustomInput from "../../components/CustomInput";
import CustomSelect from "../../components/CustomSelect";
import TooltipIcon from "../../components/TooltipIcon";
import { comdex } from "../../config/network";
import {
  ValidateInputNumber,
  ValidatePriceInputNumber
} from "../../config/_validation";
import {
  DEFAULT_FEE,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DOLLAR_DECIMALS,
  MAX_SLIPPAGE_TOLERANCE
} from "../../constants/common";
import {
  queryLiquidityPair,
  queryLiquidityPairs,
  queryPool,
  queryPoolsList
} from "../../services/liquidity/query";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance
} from "../../utils/coin";
import { decimalConversion, marketPrice } from "../../utils/number";
import {
  toDecimals,
  uniqueLiquidityPairDenoms,
  uniqueQuoteDenomsForBase
} from "../../utils/string";
import variables from "../../utils/variables";
import CustomButton from "./CustomButton";
import "./index.scss";
import Order from "./Order";

const Swap = ({
  lang,
  offerCoin,
  demandCoin,
  setReverse,
  markets,
  pools,
  setPool,
  setPoolBalance,
  balances,
  reverse,
  setPools,
  setDemandCoinDenom,
  setOfferCoinDenom,
  setOfferCoinAmount,
  setDemandCoinAmount,
  setSlippage,
  slippage,
  setPair,
  setPairs,
  pairs,
  pair,
  pool,
  poolBalance,
  params,
  isLimitOrder,
  setLimitOrderToggle,
  limitPrice,
  setLimitPrice,
  baseCoinPoolPrice,
  setBaseCoinPoolPrice,
}) => {
  const [validationError, setValidationError] = useState();
  const [liquidityPairs, setLiquidityPairs] = useState();
  const [priceValidationError, setPriceValidationError] = useState();
  const [orderLifespan, setOrderLifeSpan] = useState(21600);

  useEffect(() => {
    const firstPool = pools[0];
    const poolPair = pairs?.list?.filter(
      (item) => item.id.toNumber === firstPool?.pairId.toNumber
    )[0];

    if (!offerCoin?.denom && poolPair?.id) {
      setOfferCoinDenom(poolPair?.baseCoinDenom);
    }
    if (!demandCoin?.denom && poolPair?.id) {
      setDemandCoinDenom(poolPair?.quoteCoinDenom);
    }

    if (poolPair?.id) {
      updatePoolDetails(poolPair?.baseCoinDenom, poolPair?.quoteCoinDenom);
    }

    setReverse(false);
    resetValues();
  }, [pools, pairs]);

  useEffect(() => {
    fetchPairs(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );

    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );

    // returned function will be called on component unmount
    return () => {
      setOfferCoinDenom("");
      setDemandCoinDenom("");
    };
  }, []);

  useEffect(() => {
    queryLiquidityPairs((error, result) => {
      if (error) {
        return;
      }

      setLiquidityPairs(result?.pairs);
    });
  }, []);

  useEffect(() => {
    if (offerCoin?.amount) {
      const demandCoinPrice = reverse
        ? 1 / baseCoinPoolPrice
        : baseCoinPoolPrice;

      calculateDemandCoinAmount(demandCoinPrice, offerCoin?.amount);
    }
  }, [baseCoinPoolPrice]);

  const fetchPairs = () => {
    queryLiquidityPairs((error, data) => {
      if (error) {
        message.error(error);
        return;
      }

      setPairs(data.pairs, data.pagination);
    });
  };

  const fetchPools = (offset, limit, countTotal, reverse) => {
    queryPoolsList(offset, limit, countTotal, reverse, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setPools(result.pools);
    });
  };

  const resetValues = () => {
    setOfferCoinAmount(0, 0);
    setDemandCoinAmount(0);
    setValidationError();
    setLimitPrice(0);
    setSlippage(0);
  };

  useEffect(() => {
    if (pool?.balances?.length > 0) {
      const baseCoinBalanceInPool = pool?.balances?.find(
        (item) => item.denom === pair?.baseCoinDenom
      )?.amount;
      const quoteCoinBalanceInPool = pool?.balances?.find(
        (item) => item.denom === pair?.quoteCoinDenom
      )?.amount;
      const baseCoinPoolPrice = Number(
        quoteCoinBalanceInPool / baseCoinBalanceInPool
      ).toFixed(comdex?.coinDecimals);

      setBaseCoinPoolPrice(baseCoinPoolPrice);
    }
  }, [pool]);

  const updatePoolDetails = async (denomIn, denomOut) => {
    const selectedPair = pairs?.list?.filter(
      (item) =>
        (item.baseCoinDenom === denomIn && item.quoteCoinDenom === denomOut) ||
        (item.baseCoinDenom === denomOut && item.quoteCoinDenom === denomIn)
    )[0];

    if (selectedPair?.id) {
      setPair(selectedPair);

      const selectedPool = pools.filter(
        (item) => item.pairId.toNumber() === selectedPair?.id.toNumber()
      )[0];

      setPool(selectedPool);
      setPoolBalance(selectedPool?.balances);
    } else {
      setPair({});
      setPool({});
    }
  };

  const onChange = (value) => {
    value = toDecimals(value).toString().trim();
    handleOfferCoinAmountChange(value);
  };

  const handleOfferCoinAmountChange = (value) => {
    const selectedAsset = poolBalance.filter(
      (item) => item?.denom === offerCoin?.denom
    )[0];

    const assetVolume =
      selectedAsset && selectedAsset.amount && Number(selectedAsset.amount);

    // (input_number / (input token share in pool + input_number))*100
    setSlippage(
      (Number(value) /
        (Number(amountConversion(assetVolume)) + Number(value))) *
        100
    );

    const offerCoinFee =
      value * decimalConversion(params?.swapFeeRate) +
      decimalConversion(params?.swapFeeRate) / 10;

    setValidationError(
      ValidateInputNumber(Number(getAmount(value)), availableBalance, "macro")
    );

    setOfferCoinAmount(value, offerCoinFee);

    if (isLimitOrder && limitPrice) {
      return calculateDemandCoinAmount(limitPrice, value);
    }

    const demandCoinPrice = reverse ? 1 / baseCoinPoolPrice : baseCoinPoolPrice; // calculating price from pool

    calculateDemandCoinAmount(demandCoinPrice, value);
  };

  const calculateDemandCoinAmount = (price, input) => {
    const amount = price * input;
    setDemandCoinAmount(amount.toFixed(6));
  };

  const handleDemandCoinDenomChange = (value) => {
    if (offerCoin?.denom === value) {
      handleSwapChange();
    } else {
      setDemandCoinDenom(value);
    }

    if (isLimitOrder) {
      setLimitPrice(0);
      setPriceValidationError();
    }

    setDemandCoinDenom(value);
    updatePoolDetails(offerCoin?.denom, value);
  };

  const handleOfferCoinDenomChange = (value) => {
    if (demandCoin?.denom === value) {
      handleSwapChange();
    } else {
      setOfferCoinDenom(value);
    }

    if (isLimitOrder) {
      setLimitPrice(0);
      setPriceValidationError();
    }
    updatePoolDetails(value, demandCoin?.denom);
  };

  const availableBalance = getDenomBalance(balances, offerCoin?.denom) || 0;

  const showOfferCoinSpotPrice = () => {
    const denomIn = denomConversion(offerCoin?.denom);

    const denomOut = denomConversion(demandCoin?.denom);

    const price = reverse ? 1 / baseCoinPoolPrice : baseCoinPoolPrice;

    return `1 ${denomIn || ""} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(6)} ${denomOut || ""}`;
  };

  const showOfferCoinValue = () => {
    const price = reverse ? 1 / baseCoinPoolPrice : baseCoinPoolPrice;
    const demandCoinPrice = marketPrice(markets, demandCoin?.denom);
    const total = price * demandCoinPrice * offerCoin?.amount;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  const showDemandCoinSpotPrice = () => {
    const denomIn = denomConversion(offerCoin?.denom);

    const denomOut = denomConversion(demandCoin?.denom);

    const price = reverse ? baseCoinPoolPrice : 1 / baseCoinPoolPrice;

    return `1 ${denomOut || ""} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(6)} ${denomIn || ""}`;
  };

  const handleSwapChange = () => {
    const demandCoinDenom = demandCoin?.denom;
    const offerCoinDenom = offerCoin?.denom;
    setDemandCoinDenom(offerCoinDenom);
    setOfferCoinDenom(demandCoinDenom);
    setOfferCoinAmount(0);
    setDemandCoinAmount(0);
    setLimitPrice(0);
    setReverse(!reverse);
  };

  const showPoolPrice = () => {
    let price = Number(
      baseCoinPoolPrice && isFinite(baseCoinPoolPrice) ? baseCoinPoolPrice : 0
    );

    return (pool?.id ? price || 0 : 0).toFixed(6);
  };

  const handleMaxClick = () => {
    if (offerCoin?.denom === comdex.coinMinimalDenom) {
      const value =
        Number(availableBalance) > DEFAULT_FEE
          ? availableBalance - DEFAULT_FEE
          : 0;
      const nativeOfferCoinFee = value * decimalConversion(params?.swapFeeRate);

      return Number(value) > nativeOfferCoinFee
        ? handleOfferCoinAmountChange(
            amountConversion(value - nativeOfferCoinFee)
          )
        : handleOfferCoinAmountChange();
    } else {
      const value = Number(availableBalance);
      const offerCoinFee = value * decimalConversion(params?.swapFeeRate);

      return Number(value) > offerCoinFee
        ? handleOfferCoinAmountChange(amountConversion(value - offerCoinFee))
        : handleOfferCoinAmountChange();
    }
  };

  const handleHalfClick = () => {
    if (offerCoin?.denom === comdex.coinMinimalDenom) {
      const value =
        Number(availableBalance / 2) > DEFAULT_FEE ? availableBalance / 2 : 0;
      const nativeOfferCoinFee =
        value * (decimalConversion(params?.swapFeeRate) / 2);

      return Number(value) > nativeOfferCoinFee
        ? handleOfferCoinAmountChange(amountConversion(value))
        : handleOfferCoinAmountChange();
    } else {
      const value = Number(availableBalance / 2);
      const offerCoinFee = value * (decimalConversion(params?.swapFeeRate) / 2);

      return Number(value) > offerCoinFee
        ? handleOfferCoinAmountChange(amountConversion(value))
        : handleOfferCoinAmountChange();
    }
  };

  const handleLimitPriceChange = (price) => {
    price = toDecimals(price).toString().trim();

    setLimitPrice(price);

    if (pair?.lastPrice) {
      setPriceValidationError(
        ValidatePriceInputNumber(
          Number(price),
          Number(decimalConversion(pair?.lastPrice)),
          Number(decimalConversion(params?.maxPriceLimitRatio))
        )
      );
    } else {
      setPriceValidationError(false);
    }
    calculateDemandCoinAmount(price, offerCoin?.amount);
  };

  const handleLimitSwitchChange = (value) => {
    setLimitOrderToggle(value);
    resetValues();
  };

  const inputOptions = uniqueLiquidityPairDenoms(
    liquidityPairs,
    !reverse ? "in" : "out"
  );

  const outputOptions = uniqueQuoteDenomsForBase(
    liquidityPairs,
    !reverse ? "in" : "out",
    offerCoin?.denom
  );

  const handleRefreshDetails = () => {
    setLimitPrice(0);
    fetchPair();
    fetchPool();
    setSlippage(0);
  };

  useEffect(() => {
    if (pool?.id) {
      let intervalId = setInterval(() => fetchPool(), 10000);

      return () => clearInterval(intervalId);
    }

    if (isLimitOrder && pair?.id) {
      let intervalId = setInterval(() => fetchPair(), 10000);

      return () => clearInterval(intervalId);
    }
  }, [pool]);

  const fetchPair = () => {
    queryLiquidityPair(pair?.id, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      if (result?.pair) {
        setPair(result?.pair);
      }
    });
  };

  const fetchPool = () => {
    queryPool(pool?.id, (error, result) => {
      if (error) {
        return;
      }

      setPool(result?.pool);
    });
  };

  const handleOrderLifespanChange = (value) => {
    value = value.toString().trim();

    if (value >= 0 && value <= params?.maxOrderLifespan?.seconds.toNumber()) {
      setOrderLifeSpan(value);
    }
  };

  const priceRange = (lastPrice, maxPriceLimitRatio) => {
    return `${(lastPrice - maxPriceLimitRatio * lastPrice).toFixed(
      comdex?.coinDecimals
    )} - ${(lastPrice + maxPriceLimitRatio * lastPrice).toFixed(
      comdex?.coinDecimals
    )}`;
  };

  const SettingPopup = (
    <div className="slippage-tolerance">
      <div>
        Limit order lifespan{" "}
        <TooltipIcon text="Your transaction will revert if it is pending for more than this period of time." />
      </div>
      <div className="tolerance-bottom">
        <Radio.Group
          onChange={(event) => setOrderLifeSpan(event.target.value)}
          defaultValue="a"
          value={orderLifespan}
        >
          <Radio.Button value={0}>1Block</Radio.Button>
          <Radio.Button value={21600}>6H</Radio.Button>
          <Radio.Button value={43200}>12H</Radio.Button>
          <Radio.Button value={86400}>24H</Radio.Button>
        </Radio.Group>
        <div className="input-section lifespan-setting">
          <CustomInput
            className="input-cmdx"
            onChange={(event) => handleOrderLifespanChange(event.target.value)}
            value={orderLifespan}
            validationError={false}
            placeholder="0"
          />
          <span className="percent-text">S</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-content-wrapper cswap-section">
      <div className="app-content-small">
        <Row>
          <Col>
            <div
              className={
                isLimitOrder ? "cswap-content toggle_active" : "cswap-content "
              }
            >
              <CustomSwitch
                onChange={(value) => handleLimitSwitchChange(value)}
                name="Limit Order"
                isChecked={isLimitOrder}
              />

              {isLimitOrder ? (
                <Popover
                  className="setting-popover"
                  content={SettingPopup}
                  placement="bottomRight"
                  overlayClassName="cmdx-popver"
                  trigger="click"
                >
                  <SvgIcon name="setting" viewbox="0 0 33 33" />
                </Popover>
              ) : null}
              <div className="assets-select-card">
                <div className="assets-left">
                  <label className="leftlabel">
                    {isLimitOrder ? "Sell" : variables[lang].from}
                  </label>
                  <div className="assets-select-wrapper">
                    <CustomSelect
                      value={
                        offerCoin?.denom && outputOptions.length > 0
                          ? offerCoin?.denom
                          : null
                      }
                      onChange={handleOfferCoinDenomChange}
                      list={inputOptions.length > 0 ? inputOptions : null}
                    />
                  </div>
                </div>
                <div className="assets-right">
                  <div className="label-right">
                    {variables[lang].available}
                    <span className="ml-1">
                      {amountConversionWithComma(availableBalance)}{" "}
                      {denomConversion(offerCoin?.denom)}
                    </span>{" "}
                    <div className="maxhalf">
                      <Button
                        className="active"
                        onClick={() => handleMaxClick()}
                      >
                        {variables[lang].max}
                      </Button>{" "}
                      <Button onClick={() => handleHalfClick()}>
                        {variables[lang].half}
                      </Button>
                    </div>
                  </div>
                  <div className="input-select">
                    <CustomInput
                      value={offerCoin && offerCoin.amount}
                      className="assets-select-input with-select"
                      onChange={(event) => onChange(event.target.value)}
                      validationError={validationError}
                    />
                    <small>{pool?.id && showOfferCoinSpotPrice()}</small>
                  </div>
                </div>
              </div>
              <div className="buysell-arrow">
                <SvgIcon
                  onClick={handleSwapChange}
                  name="buy-sell-arrow"
                  viewbox="0 0 30.937 32.344"
                />
              </div>
              {!isLimitOrder ? (
                <div className="assets-select-card">
                  <div className="assets-left">
                    <label className="leftlabel">{variables[lang].to}</label>
                    <div className="assets-select-wrapper">
                      <CustomSelect
                        value={
                          demandCoin?.denom && outputOptions.length > 0
                            ? demandCoin?.denom
                            : null
                        }
                        onChange={handleDemandCoinDenomChange}
                        list={outputOptions.length > 0 ? outputOptions : null}
                      />
                    </div>
                  </div>
                  <div className="assets-right swap-assets-right">
                    <div>
                      <CustomInput
                        disabled
                        className="assets-select-input with-select"
                        value={demandCoin && demandCoin.amount}
                      />{" "}
                      <small>{pool?.id && showDemandCoinSpotPrice()}</small>
                    </div>
                  </div>
                </div>
              ) : null}
              {isLimitOrder ? (
                <>
                  <div className="assets-select-card pool_price_section">
                    <div className="assets-left">
                      <label className="leftlabel">
                        {variables[lang].at_price}
                      </label>
                      <div className="assets-select-wrapper">
                        {denomConversion(pair?.quoteCoinDenom)}/
                        {denomConversion(pair?.baseCoinDenom)}
                      </div>
                    </div>
                    <div className="assets-right swap-assets-right">
                      <div className="label-right">
                        {variables[lang].pool_price}:
                        <span
                          className="ml-1 cursor-pointer"
                          onClick={() =>
                            handleLimitPriceChange(
                              Number(baseCoinPoolPrice).toFixed(
                                comdex.coinDecimals
                              )
                            )
                          }
                        >
                          {showPoolPrice()}
                        </span>{" "}
                      </div>
                      <div>
                        <CustomInput
                          onChange={(event) =>
                            handleLimitPriceChange(event.target.value)
                          }
                          className="assets-select-input with-select"
                          value={limitPrice}
                        />{" "}
                      </div>
                      <div className="label-right">
                        Tolerance range:
                        <span className="ml-1 cursor-pointer">
                          {priceRange(
                            Number(decimalConversion(pair?.lastPrice)),
                            Number(
                              decimalConversion(params?.maxPriceLimitRatio)
                            )
                          )}
                        </span>{" "}
                      </div>
                    </div>
                  </div>
                  <div className="assets-select-card mt-3">
                    <div className="assets-left">
                      <label className="leftlabel">
                        {variables[lang].you_get}
                      </label>
                      <div className="assets-select-wrapper mt-2">
                        <CustomSelect
                          value={
                            demandCoin?.denom && outputOptions.length > 0
                              ? demandCoin?.denom
                              : null
                          }
                          onChange={handleDemandCoinDenomChange}
                          list={outputOptions.length > 0 ? outputOptions : null}
                        />
                      </div>
                    </div>
                    <div className="assets-right swap-assets-right">
                      <div>
                        <CustomInput
                          disabled
                          value={
                            limitPrice
                              ? reverse
                                ? Number(
                                    offerCoin?.amount / limitPrice
                                  ).toFixed(comdex.coinDecimals)
                                : demandCoin?.amount
                              : 0
                          }
                          className="assets-select-input with-select"
                        />{" "}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              <Row>
                <Col sm="10" className="mt-3 mx-auto card-bottom-details">
                  {!isLimitOrder ? (
                    <Row className="mt-1">
                      <Col>
                        <label>{variables[lang].estimated_slippage}</label>
                      </Col>
                      <Col
                        className={
                          MAX_SLIPPAGE_TOLERANCE < slippage
                            ? "alert-label text-right"
                            : "text-right"
                        }
                      >
                        {Number(slippage)?.toFixed(comdex.coinDecimals)}%
                      </Col>
                    </Row>
                  ) : null}
                  <Row className="mt-1">
                    <Col>
                      <label>
                        {isLimitOrder ? "Trade Fee" : variables[lang].swap_fee}{" "}
                        <TooltipIcon text={variables[lang].tooltip_tx_fee} />
                      </label>
                    </Col>
                    <Col className="text-right">
                      {Number(decimalConversion(params?.swapFeeRate) || 0) *
                        100}
                      %
                    </Col>
                  </Row>
                </Col>
              </Row>
              {!isLimitOrder ? (
                <Row className="mt-3">
                  <Col className="text-left note-text">
                    Note: The requested swap could be completed fully,
                    partially, or canceled due to price limiting and to maintain
                    pool stability.
                  </Col>
                </Row>
              ) : null}
              <div className="assets-form-btn">
                <CustomButton
                  isLimitOrder={isLimitOrder}
                  limitPrice={limitPrice}
                  lang={lang}
                  pair={pair}
                  orderLifespan={orderLifespan}
                  refreshDetails={handleRefreshDetails}
                  orderDirection={reverse ? 1 : 2}
                  baseCoinPoolPrice={baseCoinPoolPrice}
                  validationError={
                    validationError || (isLimitOrder && priceValidationError)
                  }
                  isDisabled={
                    !pool?.id ||
                    !Number(demandCoin?.amount) ||
                    (isLimitOrder
                      ? !Number(limitPrice) || priceValidationError?.message
                      : false)
                  }
                  max={availableBalance}
                  name={
                    !pool?.id
                      ? "No pool exists"
                      : MAX_SLIPPAGE_TOLERANCE < slippage && !isLimitOrder
                      ? variables[lang].swap_anyway
                      : variables[lang].swap
                  }
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <div className="order_table_section">
        {isLimitOrder ? <Order lang={lang} /> : null}
      </div>
    </div>
  );
};

export default Swap;
