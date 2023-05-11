import styles from './Trade.module.scss';
import { Icon } from '@/shared/image/Icon';
import { NextImage } from '@/shared/image/NextImage';
import { ATOM, Arrow, CMDS } from '@/shared/image';
import Toggle from '@/shared/components/toggle/Toggle';
import { useState } from 'react';
import { OrderData } from './Data';
import dynamic from 'next/dynamic';
import CustomInput from '@/shared/components/CustomInput/Input';
import MyDropdown from '@/shared/components/dropDown/Dropdown';
import { Popover, Radio } from 'antd';
import CustomSelect from '@/shared/components/CustomSelect/Select';
import { amountConversionWithComma, denomConversion } from '@/utils/coin';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { decimalConversion, getExponent } from '@/utils/number';

const Card = dynamic(() => import('@/shared/components/card/Card'));
interface TradeCardProps {
  theme: string;
  orderLifespan: any;
  setOrderLifeSpan: any;
  handleOrderLifespanChange: any;
  assetsInProgress: any;
  offerCoin: any;
  outputOptions: any;
  handleOfferCoinDenomChange: any;
  inputOptions: any;
  availableBalance: any;
  handleMaxClick: any;
  handleHalfClick: any;
  pool: any;
  isFinalSlippage: any;
  slippage: any;
  onChange: any;
  validationError: any;
  showOfferCoinValue: any;
  showOfferCoinSpotPrice: any;
  handleSwapChange: any;
  handleLimitPriceChange: any;
  baseCoinPoolPrice: any;
  showPoolPrice: any;
  pair: any;
  demandCoin: any;
  handleDemandCoinDenomChange: any;
  limitPrice: any;
  priceRange: any;
  showDemandCoinValue: any;
  showDemandCoinSpotPrice: any;
  reverse: any;
}

const TradeCard = ({
  theme,
  orderLifespan,
  setOrderLifeSpan,
  handleOrderLifespanChange,
  assetsInProgress,
  offerCoin,
  outputOptions,
  handleOfferCoinDenomChange,
  inputOptions,
  availableBalance,
  handleMaxClick,
  handleHalfClick,
  pool,
  isFinalSlippage,
  slippage,
  onChange,
  validationError,
  showOfferCoinValue,
  showOfferCoinSpotPrice,
  handleSwapChange,
  handleLimitPriceChange,
  baseCoinPoolPrice,
  showPoolPrice,
  pair,
  demandCoin,
  handleDemandCoinDenomChange,
  limitPrice,
  priceRange,
  showDemandCoinValue,
  showDemandCoinSpotPrice,
  reverse,
}: TradeCardProps) => {
  const [toggleValue, setToggleValue] = useState<boolean>(false);
  const asset = useAppSelector((state) => state.asset);
  const comdex = useAppSelector((state) => state.config.config);
  const params = useAppSelector((state) => state.swap.params);

  const handleToggleValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToggleValue(e.target.checked);
  };

  // const items = [
  //   {
  //     key: '1',
  //     label: (
  //       <div className={styles.token__dropdown__child}>
  //         <h4>Loading...</h4>
  //       </div>
  //     ),
  //   },
  // ];

  const settingItems = (
    <div className={styles.settings__dropdown__child}>
      <div
        className={`${styles.settings__dropdown__title} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        {'Limit Order Lifespan'}
      </div>
      <div
        className={`${styles.settings__dropdown__footer} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
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
        <div
          className={`${styles.settings__dropdown__input} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <input
            type="text"
            onChange={(event) => handleOrderLifespanChange(event.target.value)}
            value={orderLifespan}
            placeholder="0"
          />{' '}
          {'s'}
        </div>
      </div>
    </div>
  );

  const TradeFooterData: any = [
    {
      id: 0,
      leftData: 'Estimated Slippage',
      rightData: `${pool?.type === 2 && isFinalSlippage ? '>' : ''}
      ${Number(slippage)?.toFixed(comdex.coinDecimals)}%,`,
    },
    {
      id: 1,
      leftData: 'Swap Fee',
      rightData: `${Number(decimalConversion(params?.swapFeeRate) || 0) * 100}
      %`,
    },
  ];

  console.log(availableBalance, asset.map[offerCoin?.denom]?.decimals);

  return (
    <div className={styles.tradeCard__wrap}>
      <Card>
        <div className={styles.tradeCard__main}>
          <div
            className={`${styles.tradeCard__head} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.tradeCard__head__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <Toggle handleToggleValue={handleToggleValue} />
              <span>{'Limit Order'}</span>
            </div>

            <div className={styles.settings__dropdown}>
              {toggleValue && (
                <Popover
                  className="setting-popover"
                  content={settingItems}
                  placement="bottomRight"
                  overlayClassName="cmdx-popver"
                  trigger="click"
                >
                  <div>
                    <Icon className={`bi bi-gear-fill`} size={'1.2rem'} />
                  </div>
                </Popover>
              )}
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
                  {toggleValue ? 'Sell' : 'From'}
                </div>

                <div className={styles.tradeCard__body__right__el1}>
                  <div
                    className={`${styles.tradeCard__body__right__el1__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Available'}{' '}
                    <span>
                      {amountConversionWithComma(
                        availableBalance,
                        asset.map[offerCoin?.denom]?.decimals
                      )}
                      {denomConversion(offerCoin?.denom)}
                    </span>
                  </div>
                  <div
                    className={`${
                      styles.tradeCard__body__right__el1__description
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                    onClick={() => handleMaxClick()}
                  >
                    {'MAX'}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__footer} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                    onClick={() => handleHalfClick()}
                  >
                    {'HALF'}
                  </div>
                </div>
              </div>

              <div className={styles.tradeCard__body__right}>
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
                {/* <MyDropdown items={items} placement={'bottomLeft'}>
                  <div
                    className={`${
                      styles.tradeCard__body__left__item__details
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <div className={`${styles.tradeCard__logo__wrap}`}>
                      <div className={`${styles.tradeCard__logo}`}>
                        <NextImage src={ATOM} alt="Logo_Dark" />
                      </div>
                    </div>

                    <div
                      className={`${
                        styles.tradeCard__body__left__item__details__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'ATOM'}
                    </div>
                    <Icon className={`bi bi-chevron-down`} />
                  </div>
                </MyDropdown> */}

                <div>
                  <div>
                    <CustomInput
                      value={offerCoin && offerCoin.amount}
                      // className="assets-select-input with-select"
                      onChange={(event: any) => onChange(event.target.value)}
                      validationError={validationError}
                    />
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el3} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {pool?.id && showOfferCoinValue()}
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

          <div className={styles.tradeCard__swap}>
            <NextImage src={Arrow} alt="Logo_Dark" onClick={handleSwapChange} />
          </div>

          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {toggleValue ? 'At' : 'To'}
                </div>

                {toggleValue && (
                  <div
                    className={`${styles.tradeCard__body__limit__body} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Base Price: '}{' '}
                    <span
                      onClick={() =>
                        handleLimitPriceChange(
                          Number(baseCoinPoolPrice).toFixed(comdex.coinDecimals)
                        )
                      }
                    >
                      {showPoolPrice()}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.tradeCard__body__right}>
                {toggleValue ? (
                  <div
                    className={`${
                      styles.tradeCard__body__left__item__toggle_title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {denomConversion(pair?.quoteCoinDenom)}/
                    {denomConversion(pair?.baseCoinDenom)}
                  </div>
                ) : (
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
                  // <MyDropdown items={items} placement={'bottomLeft'}>
                  //   <div
                  //     className={`${
                  //       styles.tradeCard__body__left__item__details
                  //     } ${theme === 'dark' ? styles.dark : styles.light}`}
                  //   >
                  //     <div className={`${styles.tradeCard__logo__wrap}`}>
                  //       <div className={`${styles.tradeCard__logo}`}>
                  //         <NextImage src={CMDS} alt="Logo_Dark" />
                  //       </div>
                  //     </div>
                  //     <div
                  //       className={`${
                  //         styles.tradeCard__body__left__item__details__title
                  //       } ${theme === 'dark' ? styles.dark : styles.light}`}
                  //     >
                  //       {'CMDX'}
                  //     </div>
                  //     <Icon className={`bi bi-chevron-down`} />
                  //   </div>
                  // </MyDropdown>
                )}

                <div>
                  {toggleValue ? (
                    <>
                      <div>
                        <CustomInput
                          onChange={(event: any) =>
                            handleLimitPriceChange(event.target.value)
                          }
                          className="assets-select-input with-select"
                          value={limitPrice}
                        />
                      </div>
                      <div
                        className={`${styles.tradeCard__body__limit__body} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {'Tolerance Range: '}{' '}
                        <span>
                          {' '}
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
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <CustomInput
                          disabled
                          className="assets-select-input with-select"
                          value={demandCoin && demandCoin.amount}
                        />
                      </div>
                      <div
                        className={`${styles.tradeCard__body__right__el3} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {pool?.id && showDemandCoinValue()}
                      </div>
                      <div
                        className={`${styles.tradeCard__body__right__el4} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {pool?.id && showDemandCoinSpotPrice()}
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
                  className={`${styles.tradeCard__body__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'And Get'}
                </div>
                <div className={styles.tradeCard__body__right}>
                  <CustomSelect
                    value={
                      demandCoin?.denom && outputOptions?.length > 0
                        ? demandCoin?.denom
                        : null
                    }
                    onChange={handleDemandCoinDenomChange}
                    list={outputOptions?.length > 0 ? outputOptions : null}
                  />
                  {/* <MyDropdown items={items} placement={'bottomLeft'}>
                    <div
                      className={`${
                        styles.tradeCard__body__left__item__details
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <div className={`${styles.tradeCard__logo__wrap}`}>
                        <div className={`${styles.tradeCard__logo}`}>
                          <NextImage src={CMDS} alt="Logo_Dark" />
                        </div>
                      </div>
                      <div
                        className={`${
                          styles.tradeCard__body__left__item__details__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'CMDX'}
                      </div>
                      <Icon className={`bi bi-chevron-down`} />
                    </div>
                  </MyDropdown> */}

                  <div>
                    <CustomInput
                      disabled
                      value={
                        limitPrice
                          ? reverse
                            ? Number(offerCoin?.amount / limitPrice).toFixed(
                                comdex.coinDecimals
                              )
                            : demandCoin?.amount
                          : 0
                      }
                      className="assets-select-input with-select"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.tradeCard__description}>
            {TradeFooterData.map((item: any, i: any) => {
              return toggleValue && i === 0 ? null : (
                <div
                  className={styles.tradeCard__description__el}
                  key={item.id}
                >
                  <div
                    className={`${styles.tradeCard__description__left_title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {item.leftData}
                  </div>
                  <div
                    className={`${styles.tradeCard__description__right_title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {item.rightData}
                  </div>
                </div>
              );
            })}

            {!toggleValue && (
              <div
                className={`${styles.tradeCard__description__el2} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {
                  'Note: The requested swap could be completed fully, partially, or cancelled due to price limiting and to maintain pool stability.'
                }
              </div>
            )}
          </div>

          <div
            className={`${styles.tradeCard__button__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <button>{'Swap'}</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradeCard;
