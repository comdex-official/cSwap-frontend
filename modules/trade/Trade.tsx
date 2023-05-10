import dynamic from 'next/dynamic';
import styles from './Trade.module.scss';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useEffect, useState } from 'react';
import { getPairMappings, toDecimals } from '@/utils/string';
import { amountConversion, getAmount, getDenomBalance } from '@/utils/coin';
import { decimalConversion } from '@/utils/number';
import { ValidateInputNumber } from '@/config/_validation';
import {
  calculateRangedPoolPrice,
  calculateSlippage,
  getNewRangedPoolRatio,
} from '@/utils/slippage';
import {
  queryLiquidityPairs,
  queryPoolsList,
} from '@/services/liquidity/query';
import { message } from 'antd';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/common';

const TradeCard = dynamic(() => import('@/modules/trade/TradeCard'));

const Trade = () => {
  const theme = useAppSelector((state: any) => state.theme.theme);
  const account = useAppSelector((state) => state.account);

  const [validationError, setValidationError] = useState<any>();
  const [priceValidationError, setPriceValidationError] = useState<any>();
  const [orderLifespan, setOrderLifeSpan] = useState<any>(21600);
  const [pairsMapping, setPairsMapping] = useState<any>({});
  const [outputOptions, setoutputOptions] = useState<any>([]);
  const [inputOptions, setinputOptions] = useState<any>([]);
  const [isFinalSlippage, setFinalSlippage] = useState(false);
  const [pools, setPools] = useState<any>([]);
  const [offerCoin, setDemandCoinDenom] = useState<any>(null);
  const [demandCoin, setOfferCoinDenom] = useState<any>(null);
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
    fetchPairs();

    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );

    // returned function will be called on component unmount
    return () => {
      setOfferCoinDenom('');
      setDemandCoinDenom('');
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

      setPairs({ pair: data.pairs, pag: data.pagination });
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
    value = toDecimals(value, assetMap[offerCoin?.denom]?.decimals)
      .toString()
      .trim();
    handleOfferCoinAmountChange(value);
  };

  const handleOfferCoinAmountChange = (value: any) => {
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

      const [newRx, newRy, final] = getNewRangedPoolRatio(
        quoteAmount,
        baseAmount,
        reverse ? 'buy' : 'sell',
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

  const availableBalance =
    getDenomBalance(account?.accountBalance, offerCoin?.denom) || 0;

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

  return (
    <>
      <div className={styles.trade__wrap}>
        <TradeCard theme={theme} />
      </div>
    </>
  );
};

export default Trade;
