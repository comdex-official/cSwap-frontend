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
  APP_ID,
  DEFAULT_FEE,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DOLLAR_DECIMALS,
  MAX_SLIPPAGE_TOLERANCE
} from "../../constants/common";
import {
  fetchExchangeRateValue,
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
import {
  decimalConversion,
  getExponent,
  marketPrice
} from "../../utils/number";
import {
  calculateRangedPoolPrice,
  calculateSlippage,
  getNewRangedPoolRatio
} from "../../utils/slippage";
import { getPairMappings, toDecimals } from "../../utils/string";
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
  assetMap,
  assetsInProgress,
}) => {
  const [validationError, setValidationError] = useState();
  const [priceValidationError, setPriceValidationError] = useState();
  const [orderLifespan, setOrderLifeSpan] = useState(21600);
  const [pairsMapping, setPairsMapping] = useState({});
  const [outputOptions, setoutputOptions] = useState([]);
  const [inputOptions, setinputOptions] = useState([]);
  const [isFinalSlippage, setFinalSlippage] = useState(false);

  useEffect(() => {
    const firstPool = pools[0];
    const poolPair = pairs?.list?.filter(
      (item) => item.id.toNumber === firstPool?.pairId.toNumber
    )[0];

    if (!offerCoin?.denom && !demandCoin?.denom && poolPair?.id) {
      setOfferCoinDenom(poolPair?.quoteCoinDenom);
      setDemandCoinDenom(poolPair?.baseCoinDenom);
      updatePoolDetails(poolPair?.quoteCoinDenom, poolPair?.baseCoinDenom);
    }

    resetValues();
  }, [pools, pairs]);

  useEffect(() => {
    if (pairs?.list?.length) {
      setPairsMapping(getPairMappings(pairs?.list));
    }
  }, [pairs]);

  useEffect(() => {
    setoutputOptions(pairsMapping[offerCoin?.denom]);
  }, [offerCoin?.denom, pairsMapping]);

  useEffect(() => {
    setinputOptions(Object.keys(pairsMapping));
  }, [pairsMapping]);

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
    setFinalSlippage(false);
  };

  useEffect(() => {
    if (pair?.id) {
      fetchExchangeRateValue(APP_ID, pair?.id, (error, result) => {
        if (error) {
          setBaseCoinPoolPrice(0, 0);
          return;
        }

        if (result?.pairs[0]?.base_price) {
          setBaseCoinPoolPrice(
            Number(result?.pairs[0]?.base_price) /
              10 **
                Math.abs(
                  getExponent(assetMap[pair?.baseCoinDenom]?.decimals) -
                    getExponent(assetMap[pair?.quoteCoinDenom]?.decimals)
                ),
            result?.pairs[0]?.base_price
          );
        }
      });
    }
  }, [pair, setBaseCoinPoolPrice, assetMap]);

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

      if (selectedPair?.baseCoinDenom !== denomIn) {
        setReverse(true);
      } else {
        setReverse(false);
      }
      setPool(selectedPool);
      setPoolBalance(selectedPool?.balances);
    } else {
      setPair({});
      setPool({});
    }
  };

  const onChange = (value) => {
    value = toDecimals(value, assetMap[offerCoin?.denom]?.decimals)
      .toString()
      .trim();
    handleOfferCoinAmountChange(value);
  };

  const handleOfferCoinAmountChange = (value) => {
    const selectedAsset =
      poolBalance &&
      Object.values(poolBalance).filter(
        (item) => item?.denom === offerCoin?.denom
      )[0];

    // calculating slippage for non ranged pools.

    if (pool?.type !== 2) {
      const assetVolume =
        selectedAsset && selectedAsset.amount && Number(selectedAsset.amount);

      setSlippage(
        (Number(value) /
          (Number(
            amountConversion(
              assetVolume,
              assetMap[selectedAsset?.denom]?.decimals
            )
          ) +
            Number(value))) *
          100
      );
    }

    let swapFeeRate = Number(decimalConversion(params?.swapFeeRate));
    const offerCoinFee = value * swapFeeRate;

    setValidationError(
      ValidateInputNumber(
        Number(getAmount(value, assetMap[selectedAsset?.denom]?.decimals)),
        availableBalance,
        "macro"
      )
    );

    setOfferCoinAmount(value, offerCoinFee);

    if (isLimitOrder && limitPrice) {
      return calculateDemandCoinAmount(limitPrice, value);
    }

    const demandCoinPrice = reverse ? 1 / baseCoinPoolPrice : baseCoinPoolPrice; // calculating price from pool

    calculateDemandCoinAmount(demandCoinPrice, value);
  };

  const calculateDemandCoinAmount = (price, input) => {
    const expectedOutAmount = price * input;
    setDemandCoinAmount(expectedOutAmount.toFixed(6));

    // calculating slippage for ranged pools.
    if (pool?.type === 2) {
      let minPrice = Number(decimalConversion(pool?.minPrice));
      let maxPrice = Number(decimalConversion(pool?.maxPrice));

      let baseAmount = Number(pool?.balances?.baseCoin?.amount);
      let quoteAmount = Number(pool?.balances?.quoteCoin?.amount);

      // Rx: quoteAmount, Ry: BaseAmount
      const currentPrice = Number(decimalConversion(pool?.price)); // for slippage calculation this is current price.

      const [newRx, newRy, final] = getNewRangedPoolRatio(
        quoteAmount,
        baseAmount,
        reverse ? "buy" : "sell",
        currentPrice,
        Number(getAmount(input, assetMap[offerCoin?.denom]?.decimals))
      );

      const newPrice = calculateRangedPoolPrice(
        newRx,
        newRy,
        minPrice,
        maxPrice
      );

      const slippage = calculateSlippage(currentPrice, newPrice);

      setSlippage(slippage);
      setFinalSlippage(final);
    }
  };

  const handleDemandCoinDenomChange = (value) => {
    setDemandCoinDenom(value);

    if (isLimitOrder) {
      setLimitPrice(0);
      setPriceValidationError();
    }

    setDemandCoinDenom(value);
    updatePoolDetails(offerCoin?.denom, value);
  };

  const handleOfferCoinDenomChange = (value) => {
    setOfferCoinDenom(value);

    setDemandCoinDenom(pairsMapping[value]?.[0]);

    if (isLimitOrder) {
      setLimitPrice(0);
      setPriceValidationError();
    }
    updatePoolDetails(value, pairsMapping[value]?.[0]);
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
    const total = marketPrice(markets, offerCoin?.denom) * offerCoin?.amount;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  const showDemandCoinValue = () => {
    const total = marketPrice(markets, demandCoin?.denom) * demandCoin?.amount;

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
    setOfferCoinDenom(demandCoin?.denom);
    setDemandCoinDenom(offerCoin?.denom);

    setOfferCoinAmount(0);
    setDemandCoinAmount(0);
    setLimitPrice(0);
    setSlippage(0);
    setFinalSlippage(false);
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
            amountConversion(
              value - nativeOfferCoinFee,
              assetMap[offerCoin?.denom]?.decimals
            )
          )
        : handleOfferCoinAmountChange();
    } else {
      const value = Number(availableBalance);
      const offerCoinFee = value * decimalConversion(params?.swapFeeRate);

      return Number(value) > offerCoinFee
        ? handleOfferCoinAmountChange(
            amountConversion(
              value - offerCoinFee,
              assetMap[offerCoin?.denom]?.decimals
            )
          )
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
        ? handleOfferCoinAmountChange(
            amountConversion(value, assetMap[offerCoin?.denom]?.decimals)
          )
        : handleOfferCoinAmountChange();
    } else {
      const value = Number(availableBalance / 2);
      const offerCoinFee = value * (decimalConversion(params?.swapFeeRate) / 2);

      return Number(value) > offerCoinFee
        ? handleOfferCoinAmountChange(
            amountConversion(value, assetMap[offerCoin?.denom]?.decimals)
          )
        : handleOfferCoinAmountChange();
    }
  };

  const handleLimitPriceChange = (price) => {
    price = toDecimals(price).toString().trim();

    setLimitPrice(price);

    if (pair?.lastPrice) {
      setPriceValidationError(
        ValidatePriceInputNumber(
          Number(price) *
            10 **
              Math.abs(
                getExponent(assetMap[pair?.baseCoinDenom]?.decimals) -
                  getExponent(assetMap[pair?.quoteCoinDenom]?.decimals)
              ),
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

  const handleRefreshDetails = () => {
    setLimitPrice(0);
    fetchPair();
    fetchPool();
    setSlippage(0);
    setFinalSlippage(false);
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

  const priceRange = (lastPrice, maxPriceLimitRatio, decimal) => {
    return `${((lastPrice - maxPriceLimitRatio * lastPrice) / decimal)?.toFixed(
      comdex?.coinDecimals
    )} - ${((lastPrice + maxPriceLimitRatio * lastPrice) / decimal)?.toFixed(
      comdex?.coinDecimals
    )}`;
  };

  const priceRangeValues = (lastPrice, maxPriceLimitRatio, decimal) => {
    let minPrice = (lastPrice - maxPriceLimitRatio * lastPrice) / decimal;

    let maxPrice = (lastPrice + maxPriceLimitRatio * lastPrice) / decimal;

    return { minPrice, maxPrice };
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
                      loading={assetsInProgress}
                      value={
                        offerCoin?.denom && outputOptions?.length > 0
                          ? offerCoin?.denom
                          : null
                      }
                      onChange={handleOfferCoinDenomChange}
                      list={inputOptions?.length > 0 ? inputOptions : null}
                    />
                  </div>
                </div>
                <div className="assets-right">
                  <div className="label-right">
                    {variables[lang].available}
                    <span className="ml-1">
                      {amountConversionWithComma(
                        availableBalance,
                        assetMap[offerCoin?.denom]?.decimals
                      )}{" "}
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
                    <small>{pool?.id && showOfferCoinValue()}</small>
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
                        loading={assetsInProgress}
                        value={
                          demandCoin?.denom && outputOptions?.length > 0
                            ? demandCoin?.denom
                            : null
                        }
                        onChange={handleDemandCoinDenomChange}
                        list={outputOptions?.length > 0 ? outputOptions : null}
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
                      <small>{pool?.id && showDemandCoinValue()}</small>
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
                        {variables[lang].base_price}:
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
                            ),

                            10 **
                              Math.abs(
                                getExponent(
                                  assetMap[pair?.baseCoinDenom]?.decimals
                                ) -
                                  getExponent(
                                    assetMap[pair?.quoteCoinDenom]?.decimals
                                  )
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
                            demandCoin?.denom && outputOptions?.length > 0
                              ? demandCoin?.denom
                              : null
                          }
                          onChange={handleDemandCoinDenomChange}
                          list={
                            outputOptions?.length > 0 ? outputOptions : null
                          }
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
                        {pool?.type === 2 && isFinalSlippage ? ">" : ""}
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
                  params={params}
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
        {isLimitOrder ? <Order lang={lang} assetMap={assetMap} /> : null}
      </div>
    </div>
  );
};

export default Swap;
