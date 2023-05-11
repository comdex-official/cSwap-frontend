import dynamic from 'next/dynamic';
import styles from './Trade.module.scss';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useEffect, useState } from 'react';
import { getPairMappings, toDecimals } from '@/utils/string';
import {
  amountConversion,
  denomConversion,
  getAmount,
  getDenomBalance,
} from '@/utils/coin';
import { decimalConversion, getExponent, marketPrice } from '@/utils/number';
import {
  ValidateInputNumber,
  ValidatePriceInputNumber,
} from '@/config/_validation';
import {
  calculateRangedPoolPrice,
  calculateSlippage,
  getNewRangedPoolRatio,
} from '@/utils/slippage';
import {
  fetchExchangeRateValue,
  queryLiquidityPair,
  queryLiquidityPairs,
  queryPool,
  queryPoolsList,
} from '@/services/liquidity/query';
import { message } from 'antd';
import {
  DEFAULT_FEE,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DOLLAR_DECIMALS,
} from '@/constants/common';

const TradeCard = dynamic(() => import('@/modules/trade/TradeCard'));

const Trade = () => {
  const theme = useAppSelector((state: any) => state.theme.theme);
  const account = useAppSelector((state) => state.account);
  const asset = useAppSelector((state) => state.asset);
  const comdex = useAppSelector((state) => state.config.config);
  const params = useAppSelector((state) => state.swap.params);
  const markets = useAppSelector((state) => state.oracle.market.list);

  const [validationError, setValidationError] = useState<any>();
  const [priceValidationError, setPriceValidationError] = useState<any>();
  const [orderLifespan, setOrderLifeSpan] = useState<any>(21600);
  const [pairsMapping, setPairsMapping] = useState<any>({});
  const [outputOptions, setoutputOptions] = useState<any>([]);
  const [inputOptions, setinputOptions] = useState<any>([]);
  const [isFinalSlippage, setFinalSlippage] = useState(false);
  const [pools, setPools] = useState<any>([]);
  const [offerCoin, setOfferCoinDenom] = useState<any>({});
  const [demandCoin, setDemandCoinDenom] = useState<any>({});
  const [reverse, setReverse] = useState<any>(null);
  const [pool, setPool] = useState<any>(null);
  const [poolBalance, setPoolBalance] = useState<any>(null);
  const [pairs, setPairs] = useState<any>(null);
  const [pair, setPair] = useState<any>(null);
  const [offerCoinAmount, setOfferCoinAmount] = useState<any>(null);
  const [demandCoinAmount, setDemandCoinAmount] = useState<any>(null);
  const [slippage, setSlippage] = useState<any>(null);
  const [limitPrice, setLimitPrice] = useState<any>(null);
  const [isLimitOrder, setLimitOrderToggle] = useState<any>(null);
  const [baseCoinPoolPrice, setBaseCoinPoolPrice] = useState<any>(null);

  useEffect(() => {
    const firstPool = pools[0];
    const poolPair = pairs?.list?.filter(
      (item: any) => item.id.toNumber === firstPool?.pairId.toNumber
    )[0];
    console.log(poolPair);

    if (!offerCoin?.denom && !demandCoin?.denom && poolPair?.id) {
      setOfferCoinDenom({
        denom: poolPair?.quoteCoinDenom,
      });
      setDemandCoinDenom({
        denom: poolPair?.baseCoinDenom,
      });
      updatePoolDetails(poolPair?.quoteCoinDenom, poolPair?.baseCoinDenom);
    }

    resetValues();
  }, [pools, pairs]);
  console.log({ offerCoin });

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
    fetchPairs();

    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );

    // returned function will be called on component unmount
    return () => {
      setOfferCoinDenom({});
      setDemandCoinDenom({});
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
    queryLiquidityPairs((error: any, data: any) => {
      if (error) {
        message.error(error);
        return;
      }

      setPairs({ list: data.pairs, pag: data.pagination });
    });
  };

  const fetchPools = (
    offset: any,
    limit: any,
    countTotal: any,
    reverse: any
  ) => {
    queryPoolsList(
      offset,
      limit,
      countTotal,
      reverse,
      (error: any, result: any) => {
        if (error) {
          message.error(error);
          return;
        }

        setPools(result.pools);
      }
    );
  };

  const resetValues = () => {
    setOfferCoinAmount(0);
    setDemandCoinAmount(0);
    setValidationError(null);
    setLimitPrice(0);
    setSlippage(0);
    setFinalSlippage(false);
  };

  useEffect(() => {
    if (pair?.id) {
      const app: any = process.env.NEXT_PUBLIC_APP_APP;
      const APP_ID = Number(comdex?.[app]?.appId);

      fetchExchangeRateValue(APP_ID, pair?.id, (error: any, result: any) => {
        if (error) {
          setBaseCoinPoolPrice({ originalPrice: 0, basePrice: 0 });
          return;
        }

        if (result?.pairs[0]?.base_price) {
          setBaseCoinPoolPrice({
            originalPrice:
              Number(result?.pairs[0]?.base_price) /
              10 **
                Math.abs(
                  getExponent(asset.map[pair?.baseCoinDenom]?.decimals) -
                    getExponent(asset.map[pair?.quoteCoinDenom]?.decimals)
                ),
            basePrice: result?.pairs[0]?.base_price,
          });
        }
      });
    }
  }, [pair, setBaseCoinPoolPrice, asset.map]);

  const updatePoolDetails = async (denomIn: any, denomOut: any) => {
    const selectedPair = pairs?.list?.filter(
      (item: any) =>
        (item.baseCoinDenom === denomIn && item.quoteCoinDenom === denomOut) ||
        (item.baseCoinDenom === denomOut && item.quoteCoinDenom === denomIn)
    )[0];

    if (selectedPair?.id) {
      setPair(selectedPair);

      const selectedPool = pools.filter(
        (item: any) => item.pairId.toNumber() === selectedPair?.id.toNumber()
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

  const onChange = (value: any) => {
    value = toDecimals(value, asset.map[offerCoin?.denom]?.decimals)
      .toString()
      .trim();
    handleOfferCoinAmountChange(value);
  };

  const handleOfferCoinAmountChange = (value?: any) => {
    const selectedAsset =
      poolBalance &&
      Object.values(poolBalance).filter(
        (item: any) => item?.denom === offerCoin?.denom
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
              asset.map[selectedAsset?.denom]?.decimals
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
        Number(getAmount(value, asset.map[selectedAsset?.denom]?.decimals)),
        availableBalance,
        'macro'
      )
    );

    setOfferCoinAmount({ value, offerCoinFee });

    if (isLimitOrder && limitPrice) {
      return calculateDemandCoinAmount(limitPrice, value);
    }

    const demandCoinPrice = reverse ? 1 / baseCoinPoolPrice : baseCoinPoolPrice; // calculating price from pool

    calculateDemandCoinAmount(demandCoinPrice, value);
  };

  const calculateDemandCoinAmount = (price: any, input: any) => {
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

      const [newRx, newRy, final]: any = getNewRangedPoolRatio(
        quoteAmount,
        baseAmount,
        reverse ? 'buy' : 'sell',
        currentPrice,
        Number(getAmount(input, asset.map[offerCoin?.denom]?.decimals))
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

  const handleDemandCoinDenomChange = (value: any) => {
    // setDemandCoinDenom(value);
    setDemandCoinDenom({
      ...demandCoin,
      denom: value,
    });
    if (isLimitOrder) {
      setLimitPrice(0);
      setPriceValidationError(null);
    }

    // setDemandCoinDenom(value);
    setDemandCoinDenom({
      ...demandCoin,
      denom: value,
    });
    updatePoolDetails(offerCoin?.denom, value);
  };

  const handleOfferCoinDenomChange = (value: any) => {
    setOfferCoinDenom({
      ...offerCoin,
      denom: value,
    });

    setDemandCoinDenom({
      ...demandCoin,
      denom: pairsMapping[value]?.[0],
    });

    // setDemandCoinDenom(]);

    if (isLimitOrder) {
      setLimitPrice(0);
      setPriceValidationError(null);
    }
    updatePoolDetails(value, pairsMapping[value]?.[0]);
  };

  const availableBalance =
    getDenomBalance(account?.balances, offerCoin?.denom) || 0;

  const showOfferCoinSpotPrice = () => {
    const denomIn = denomConversion(offerCoin?.denom);

    const denomOut = denomConversion(demandCoin?.denom);

    const price = reverse ? 1 / baseCoinPoolPrice : baseCoinPoolPrice;

    return `1 ${denomIn || ''} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(6)} ${denomOut || ''}`;
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

    return `1 ${denomOut || ''} = ${Number(
      price && isFinite(price) ? price : 0
    ).toFixed(6)} ${denomIn || ''}`;
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
      const nativeOfferCoinFee =
        value * +decimalConversion(params?.swapFeeRate);

      return Number(value) > nativeOfferCoinFee
        ? handleOfferCoinAmountChange(
            amountConversion(
              value - nativeOfferCoinFee,
              asset.map[offerCoin?.denom]?.decimals
            )
          )
        : handleOfferCoinAmountChange();
    } else {
      const value = Number(availableBalance);
      const offerCoinFee = value * +decimalConversion(params?.swapFeeRate);

      return Number(value) > offerCoinFee
        ? handleOfferCoinAmountChange(
            amountConversion(
              value - offerCoinFee,
              asset.map[offerCoin?.denom]?.decimals
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
        value * (+decimalConversion(params?.swapFeeRate) / 2);

      return Number(value) > nativeOfferCoinFee
        ? handleOfferCoinAmountChange(
            amountConversion(value, asset.map[offerCoin?.denom]?.decimals)
          )
        : handleOfferCoinAmountChange();
    } else {
      const value = Number(availableBalance / 2);
      const offerCoinFee =
        value * (+decimalConversion(params?.swapFeeRate) / 2);

      return Number(value) > offerCoinFee
        ? handleOfferCoinAmountChange(
            amountConversion(value, asset.map[offerCoin?.denom]?.decimals)
          )
        : handleOfferCoinAmountChange();
    }
  };

  const handleLimitPriceChange = (price: any) => {
    price = toDecimals(price).toString().trim();

    setLimitPrice(price);

    if (pair?.lastPrice) {
      setPriceValidationError(
        ValidatePriceInputNumber(
          Number(price) *
            10 **
              Math.abs(
                getExponent(asset.map[pair?.baseCoinDenom]?.decimals) -
                  getExponent(asset.map[pair?.quoteCoinDenom]?.decimals)
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

  const handleLimitSwitchChange = (value: any) => {
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
    queryLiquidityPair(pair?.id, (error: any, result: any) => {
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
    queryPool(pool?.id, (error: any, result: any) => {
      if (error) {
        return;
      }

      setPool(result?.pool);
    });
  };

  const handleOrderLifespanChange = (value: any) => {
    value = value.toString().trim();

    if (value >= 0 && value <= params?.maxOrderLifespan?.seconds.toNumber()) {
      setOrderLifeSpan(value);
    }
  };

  const priceRange = async (
    lastPrice: any,
    maxPriceLimitRatio: any,
    decimal: any
  ) => {
    return `${((lastPrice - maxPriceLimitRatio * lastPrice) / decimal)?.toFixed(
      comdex?.coinDecimals
    )} - ${((lastPrice + maxPriceLimitRatio * lastPrice) / decimal)?.toFixed(
      comdex?.coinDecimals
    )}`;
  };

  const priceRangeValues = (
    lastPrice: any,
    maxPriceLimitRatio: any,
    decimal: any
  ) => {
    let minPrice = (lastPrice - maxPriceLimitRatio * lastPrice) / decimal;

    let maxPrice = (lastPrice + maxPriceLimitRatio * lastPrice) / decimal;

    return { minPrice, maxPrice };
  };

  return (
    <>
      <div className={styles.trade__wrap}>
        <TradeCard
          theme={theme}
          orderLifespan={orderLifespan}
          setOrderLifeSpan={setOrderLifeSpan}
          handleOrderLifespanChange={handleOrderLifespanChange}
          assetsInProgress={asset.assetsInPrgoress}
          offerCoin={offerCoin}
          outputOptions={outputOptions}
          handleOfferCoinDenomChange={handleOfferCoinDenomChange}
          inputOptions={inputOptions}
          availableBalance={availableBalance}
          handleMaxClick={handleMaxClick}
          handleHalfClick={handleHalfClick}
          pool={pool}
          isFinalSlippage={isFinalSlippage}
          slippage={slippage}
          onChange={onChange}
          validationError={validationError}
          showOfferCoinValue={showOfferCoinValue}
          showOfferCoinSpotPrice={showOfferCoinSpotPrice}
          handleSwapChange={handleSwapChange}
          handleLimitPriceChange={handleLimitPriceChange}
          baseCoinPoolPrice={baseCoinPoolPrice}
          showPoolPrice={showPoolPrice}
          pair={pair}
          demandCoin={demandCoin}
          handleDemandCoinDenomChange={handleDemandCoinDenomChange}
          limitPrice={limitPrice}
          priceRange={priceRange}
          showDemandCoinValue={showDemandCoinValue}
          showDemandCoinSpotPrice={showDemandCoinSpotPrice}
          reverse={reverse}
        />
      </div>
    </>
  );
};

export default Trade;
