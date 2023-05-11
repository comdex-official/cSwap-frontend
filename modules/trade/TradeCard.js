"use client";
import styles from "./Trade.module.scss";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { Icon } from "../../shared/image/Icon";
import { NextImage } from "../../shared/image/NextImage";
import { ATOM, Arrow, CMDS } from "../../shared/image";
import Toggle from "../../shared/components/toggle/Toggle";
import { OrderData, TradeFooterData } from "./Data";
import useOutsideClick from "../../shared/hooks/useOutsideClick";
import dynamic from "next/dynamic";
import Card from "../../shared/components/card/Card";
import CustomInput from "../../shared/components/CustomInput";
import TooltipIcon from "../../shared/components/tooltip/TooltipIcon";
import { Button, message, Popover, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { comdex } from "../../config/network";
import {
  ValidateInputNumber,
  ValidatePriceInputNumber,
} from "../../config/_validation";
import {
  APP_ID,
  DEFAULT_FEE,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DOLLAR_DECIMALS,
  MAX_SLIPPAGE_TOLERANCE,
} from "../../constants/common";
import {
  fetchExchangeRateValue,
  queryLiquidityPair,
  queryLiquidityPairs,
  queryPool,
  queryPoolsList,
} from "../../services/liquidity/query";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from "../../utils/coin";
import {
  decimalConversion,
  getExponent,
  marketPrice,
} from "../../utils/number";
import {
  calculateRangedPoolPrice,
  calculateSlippage,
  getNewRangedPoolRatio,
} from "../../utils/slippage";
import { getPairMappings, toDecimals } from "../../utils/string";
import { setPair, setPairs } from "../../actions/asset";
import {
  setBaseCoinPoolPrice,
  setPool,
  setPoolBalance,
  setPools
} from "../../actions/liquidity";
import {
  setDemandCoinAmount,
  setDemandCoinDenom,
  setLimitOrderToggle,
  setLimitPrice,
  setOfferCoinAmount,
  setOfferCoinDenom,
  setParams,
  setReverse,
  setSlippage,
  setSlippageTolerance
} from "../../actions/swap";
import { useRef } from "react";

// const Card = dynamic(() => import("@/shared/components/card/Card"))

const TradeCard = ({
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
  const [toggleValue, setToggleValue] = useState(false);

  const handleToggleValue = (e) => {
    setToggleValue(e.target.checked);
  };

  let theme = "dark";
  const [isOpen, setIsOpen] = useState({
    setting: false,
    tokenFrom: false,
    tokenTo: false,
    tokenGet: false,
  });

  const settingRef = useRef();
  const tokenFromRef = useRef();
  const tokenToRef = useRef();
  const tokenGetRef = useRef();

  useOutsideClick({
    isOpen: isOpen.setting,
    node: settingRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, setting: false }),
  });

  useOutsideClick({
    isOpen: isOpen?.tokenFrom,
    node: tokenFromRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, tokenFrom: false }),
  });

  useOutsideClick({
    isOpen: isOpen?.tokenTo,
    node: tokenToRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, tokenTo: false }),
  });

  useOutsideClick({
    isOpen: isOpen?.tokenGet,
    node: tokenGetRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, tokenGet: false }),
  });

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
    <div className={styles.tradeCard__wrap}>
      <Card>
        <div className={styles.tradeCard__main}>
          <div
            className={`${styles.tradeCard__head} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.tradeCard__head__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <Toggle handleToggleValue={handleToggleValue} />
              <span>{"Limit Order"}</span>
            </div>

            <div className={styles.settings__dropdown} ref={settingRef}>
              {toggleValue && (
                <Icon
                  className={`bi bi-gear-fill`}
                  size={"1.2rem"}
                  onClick={() =>
                    setIsOpen({ ...isOpen, setting: !isOpen.setting })
                  }
                />
              )}

              {isOpen.setting && (
                <div
                  className={`${styles.settings__dropdown__child} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.settings__dropdown__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"Limit Order Lifespan"}
                  </div>
                  <div
                    className={`${styles.settings__dropdown__footer} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {OrderData.map((item, i) => (
                      <div
                        key={item.id}
                        className={`${styles.settings__dropdown__footer__title
                          } ${i === 2 && styles.active} ${theme === "dark" ? styles.dark : styles.light
                          }`}
                      >
                        {item.name}
                      </div>
                    ))}
                    <div
                      className={`${styles.settings__dropdown__input} ${theme === "dark" ? styles.dark : styles.light
                        }`}
                    >
                      <input type="text" /> {"s"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {toggleValue ? "Sell" : "From"}
                </div>

                <div className={styles.tradeCard__body__right__el1}>
                  <div
                    className={`${styles.tradeCard__body__right__el1__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"Available"} <span>{"1.99 ATOM"}</span>
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__description
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"MAX"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__footer} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"HALF"}
                  </div>
                </div>
              </div>

              <div className={styles.tradeCard__body__right}>
                <div className={styles.settings__dropdown} ref={tokenFromRef}>
                  <div
                    className={`${styles.tradeCard__body__left__item__details
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    onClick={() =>
                      setIsOpen({ ...isOpen, tokenFrom: !isOpen?.tokenFrom })
                    }
                  >
                    <div className={`${styles.tradeCard__logo__wrap}`}>
                      <div className={`${styles.tradeCard__logo}`}>
                        <NextImage src={ATOM} alt="Logo_Dark" />
                      </div>
                    </div>

                    <div
                      className={`${styles.tradeCard__body__left__item__details__title
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      {"ATOM"}
                    </div>
                    <Icon className={`bi bi-chevron-down`} />
                  </div>

                  {isOpen.tokenFrom && (
                    <div className={styles.token__dropdown__child}>
                      <h4>Loading...</h4>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className={`${styles.tradeCard__body__right__el2} ${toggleValue ? styles.limit__order : ""
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"0.00000"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el3} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"~ $0.00"}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el4} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"1 ATOM = 207.727462 CMDX"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tradeCard__swap}>
            <NextImage src={Arrow} alt="Logo_Dark" />
          </div>

          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {toggleValue ? "At" : "To"}
                </div>

                {toggleValue && (
                  <div
                    className={`${styles.tradeCard__body__limit__body} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"Base Price: "} <span>{"0.004814"}</span>
                  </div>
                )}
              </div>

              <div className={styles.tradeCard__body__right}>
                {toggleValue ? (
                  <div
                    className={`${styles.tradeCard__body__left__item__toggle_title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"ATOM/CMDX"}
                  </div>
                ) : (
                  <div className={styles.settings__dropdown} ref={tokenToRef}>
                    <div
                      className={`${styles.tradeCard__body__left__item__details
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      onClick={() =>
                        setIsOpen({ ...isOpen, tokenTo: !isOpen?.tokenTo })
                      }
                    >
                      <div className={`${styles.tradeCard__logo__wrap}`}>
                        <div className={`${styles.tradeCard__logo}`}>
                          <NextImage src={CMDS} alt="Logo_Dark" />
                        </div>
                      </div>
                      <div
                        className={`${styles.tradeCard__body__left__item__details__title
                          } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"CMDX"}
                      </div>
                      <Icon className={`bi bi-chevron-down`} />
                    </div>

                    {isOpen.tokenTo && (
                      <div className={styles.token__dropdown__child}>
                        <h4>Loading...</h4>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  {toggleValue ? (
                    <>
                      <div
                        className={`${styles.tradeCard__body__right__el2} ${toggleValue ? styles.limit__order : ""
                          } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"0.00000"}
                      </div>
                      <div
                        className={`${styles.tradeCard__body__limit__body} ${theme === "dark" ? styles.dark : styles.light
                          }`}
                      >
                        {"Tolerance Range: "}{" "}
                        <span>{"0.004310 - 0.005268"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`${styles.tradeCard__body__right__el2} ${toggleValue ? styles.limit__order : ""
                          } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"0.00000"}
                      </div>
                      <div
                        className={`${styles.tradeCard__body__right__el3} ${theme === "dark" ? styles.dark : styles.light
                          }`}
                      >
                        {"~ $0.00"}
                      </div>
                      <div
                        className={`${styles.tradeCard__body__right__el4} ${theme === "dark" ? styles.dark : styles.light
                          }`}
                      >
                        {"1 ATOM = 207.727462 CMDX"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {toggleValue && (
            <div className={styles.tradeCard__body__item}>
              <div className={styles.tradeCard__body__left}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"And Get"}
                </div>
                <div className={styles.tradeCard__body__right}>
                  <div className={styles.settings__dropdown} ref={tokenGetRef}>
                    <div
                      className={`${styles.tradeCard__body__left__item__details
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      onClick={() =>
                        setIsOpen({ ...isOpen, tokenGet: !isOpen?.tokenGet })
                      }
                    >
                      <div className={`${styles.tradeCard__logo__wrap}`}>
                        <div className={`${styles.tradeCard__logo}`}>
                          <NextImage src={CMDS} alt="Logo_Dark" />
                        </div>
                      </div>
                      <div
                        className={`${styles.tradeCard__body__left__item__details__title
                          } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"CMDX"}
                      </div>
                      <Icon className={`bi bi-chevron-down`} />
                    </div>

                    {isOpen.tokenGet && (
                      <div className={styles.token__dropdown__child}>
                        <h4>Loading...</h4>
                      </div>
                    )}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el2} ${toggleValue ? styles.limit__order : ""
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"0.00000"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.tradeCard__description}>
            {TradeFooterData.map((item, i) => {
              return toggleValue && i === 0 ? null : (
                <div
                  className={styles.tradeCard__description__el}
                  key={item.id}
                >
                  <div
                    className={`${styles.tradeCard__description__left_title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {item.leftData}
                  </div>
                  <div
                    className={`${styles.tradeCard__description__right_title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {item.rightData}
                  </div>
                </div>
              );
            })}

            {!toggleValue && (
              <div
                className={`${styles.tradeCard__description__el2} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {
                  "Note: The requested swap could be completed fully, partially, or cancelled due to price limiting and to maintain pool stability."
                }
              </div>
            )}
          </div>

          <div
            className={`${styles.tradeCard__button__wrap} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <button>{"Swap"}</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

TradeCard.propTypes = {
  setBaseCoinPoolPrice: PropTypes.func.isRequired,
  setOfferCoinDenom: PropTypes.func.isRequired,
  setOfferCoinAmount: PropTypes.func.isRequired,
  setDemandCoinAmount: PropTypes.func.isRequired,
  setLimitOrderToggle: PropTypes.func.isRequired,
  setLimitPrice: PropTypes.func.isRequired,
  setSlippage: PropTypes.func.isRequired,
  setSlippageTolerance: PropTypes.func.isRequired,
  setParams: PropTypes.func.isRequired,
  setPair: PropTypes.func.isRequired,
  setPairs: PropTypes.func.isRequired,
  setPool: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setPools: PropTypes.func.isRequired,
  setReverse: PropTypes.func.isRequired,
  assetMap: PropTypes.object,
  assetDenomMap: PropTypes.object,
  assetsInProgress: PropTypes.bool,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  baseCoinPoolPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  demandCoin: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    denom: PropTypes.string,
  }),
  handleSet: PropTypes.func,
  isLimitOrder: PropTypes.bool,
  lang: PropTypes.string,
  limitPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  markets: PropTypes.object,
  pair: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    baseCoinDenom: PropTypes.string,
    quoteCoinDenom: PropTypes.string,
    lastPrice: PropTypes.string,
  }),
  pairs: PropTypes.shape({
    list: PropTypes.arrayOf(
      PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
        liquidationRatio: PropTypes.string,
        id: PropTypes.shape({
          high: PropTypes.number,
          low: PropTypes.number,
          unsigned: PropTypes.bool,
        }),
      })
    ),
  }),
  params: PropTypes.shape({
    swapFeeRate: PropTypes.string,
    maxPriceLimitRatio: PropTypes.string,
  }),
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
  slippageTolerance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  slippage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    markets: state.oracle.market.list,
    demandCoin: state.swap.demandCoin,
    offerCoin: state.swap.offerCoin,
    reverse: state.swap.reverse,
    balances: state.account.balances.list,
    pools: state.liquidity.pool.list,
    slippage: state.swap.slippage,
    pairs: state.asset.pairs,
    pair: state.asset.pair,
    pool: state.liquidity.pool._,
    poolBalance: state.liquidity.poolBalance,
    params: state.swap.params,
    slippageTolerance: state.swap.slippageTolerance,
    isLimitOrder: state.swap.isLimitOrder,
    limitPrice: state.swap.limitPrice,
    baseCoinPoolPrice: state.liquidity.baseCoinPoolPrice,
    assetMap: state.asset.map,
    assetDenomMap: state.asset._.assetDenomMap,
    assetsInProgress: state.asset._.inProgress,
  };
};

const actionsToProps = {
  setDemandCoinDenom,
  setPool,
  setOfferCoinAmount,
  setOfferCoinDenom,
  setDemandCoinAmount,
  setPoolBalance,
  setReverse,
  setPools,
  setSlippage,
  setPairs,
  setPair,
  setSlippageTolerance,
  setLimitOrderToggle,
  setLimitPrice,
  setBaseCoinPoolPrice,
  setParams,
};

export default connect(stateToProps, actionsToProps)(TradeCard);
