import { Button, Checkbox, message, Modal, Steps } from 'antd';
import Long from 'long';
import * as PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setPoolTokenSupply } from '../../../actions/liquidity';
import CustomInput from '../../../shared/components/CustomInput';
import CustomSelect from '../../../shared/components/CustomSelect';
import { comdex } from '../../../config/network';
import { ValidateInputNumber } from '../../../config/_validation';
import { APP_ID, DEFAULT_FEE } from '../../../constants/common';
import { signAndBroadcastTransaction } from '../../../services/helper';
import { queryLiquidityPairs } from '../../../services/liquidity/query';
import { defaultFee } from '../../../services/transaction';
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from '../../../utils/coin';
import {
  errorMessageMappingParser,
  toDecimals,
  uniqueLiquidityPairDenoms,
  uniqueQuoteDenomsForBase,
} from '../../../utils/string';
import variables from '../../../utils/variables';
import { Icon } from '../../../shared/image/Icon';
import Snack from '../../../shared/components/Snack';
import styles from '../Farm.module.scss';
import { NextImage } from '../../../shared/image/NextImage';

const CreatePoolModal = ({
  openPoolModal,
  closePool,
  balances,
  address,
  refreshData,
  refreshBalance,
  params,
  lang,
  assetMap,
  iconList,
}) => {
  const theme = 'dark';

  const [current, setCurrent] = useState(0);
  const [baseToken, setBaseToken] = useState();
  const [quoteToken, setQuoteToken] = useState();
  const [baseAmount, setBaseAmount] = useState();
  const [quoteAmount, setQuoteAmount] = useState();
  const [isAccepted, setAccepted] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [liquidityPairs, setLiquidityPairs] = useState();
  const [baseAmountValidationError, setBaseAmountValidationError] = useState();
  const [quoteAmountValidationError, setQuoteAmountValidationError] =
    useState();

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

    resetValues();
  }, []);

  const resetValues = () => {
    setCurrent(0);
    setBaseToken();
    setQuoteToken();
    setBaseAmount();
    setQuoteAmount();
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
    setsearchKey('');
    setBaseToken(value);
  };

  const handleQuoteTokenChange = (value) => {
    setsearchKey('');
    setQuoteToken(value);
  };

  const handleBaseAmountChange = (value) => {
    value = toDecimals(value, assetMap[baseToken]?.decimals)?.toString().trim();
    setBaseAmountValidationError(
      ValidateInputNumber(
        Number(getAmount(value, assetMap[baseToken]?.decimals))
      )
    );
    setBaseAmount(value);
  };

  const handleQuoteAmountChange = (value) => {
    value = toDecimals(value, assetMap[quoteToken]?.decimals).toString().trim();
    setQuoteAmount(value);
    setQuoteAmountValidationError(
      ValidateInputNumber(
        Number(getAmount(value, assetMap[quoteToken]?.decimals))
      )
    );
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
          amount: getAmount(baseAmount, assetMap[baseToken]?.decimals),
        },
        {
          denom: quoteToken,
          amount: getAmount(quoteAmount, assetMap[quoteToken]?.decimals),
        },
      ];

      const sortedDepositCoins = deposits.sort((a, b) =>
        a.denom.localeCompare(b.denom)
      );

      signAndBroadcastTransaction(
        {
          message: {
            typeUrl: '/comdex.liquidity.v1beta1.MsgCreatePool',
            value: {
              creator: address.toString(),
              appId: Long.fromNumber(APP_ID),
              pairId: selectedPair?.id,
              depositCoins: sortedDepositCoins,
            },
          },
          fee: defaultFee(),
          memo: '',
        },
        address,
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            return;
          }
          if (result?.code) {
            message.info(errorMessageMappingParser(result?.rawLog));
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
      message.info('No pair exists');
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

      return handleBaseAmountChange(
        amountConversion(max, assetMap[baseToken]?.decimals)
      );
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

      return handleQuoteAmountChange(
        amountConversion(max, assetMap[quoteToken]?.decimals)
      );
    }
  };

  const [inputOptions, setinputOptions] = useState([]);
  const [outputOptions, setoutputOptions] = useState([]);
  const [inputOptions2, setinputOptions2] = useState([]);
  const [outputOptions2, setoutputOptions2] = useState([]);
  const [searchKey, setsearchKey] = useState('');

  useEffect(() => {
    setinputOptions(uniqueLiquidityPairDenoms(liquidityPairs, 'in'));
    setoutputOptions(uniqueQuoteDenomsForBase(liquidityPairs, 'in', baseToken));
  }, [liquidityPairs, baseToken]);

  const disableConditions =
    (current === 0 && (!baseToken || !quoteToken)) ||
    (current === 1 && (!baseAmount || !quoteAmount)) ||
    baseAmountValidationError?.message ||
    quoteAmountValidationError?.message;

  const onSearchChange1 = (searchKey) => {
    const searchTerm = searchKey.trim().toLowerCase();
    setsearchKey(searchTerm);
    if (searchTerm) {
      let resultsObj =
        inputOptions &&
        inputOptions?.filter((item) => {
          return denomConversion(item)
            ?.toLowerCase()
            .match(new RegExp(searchTerm, 'g'));
        });

      setinputOptions2(resultsObj);
    } else {
      setinputOptions2([]);
    }
  };

  const onSearchChange2 = (searchKey) => {
    const searchTerm = searchKey.trim().toLowerCase();
    setsearchKey(searchTerm);
    if (searchTerm) {
      let resultsObj =
        outputOptions &&
        outputOptions?.filter((item) => {
          return denomConversion(item)
            ?.toLowerCase()
            .match(new RegExp(searchTerm, 'g'));
        });

      setoutputOptions2(resultsObj);
    } else {
      setoutputOptions2([]);
    }
  };

  const steps = [
    {
      title: '',
      content: (
        <>
          <div
            className={`${styles.tradeCard__body__item} ${styles.border__radius}`}
          >
            <div className={styles.tradeCard__body__left}>
              <div
                className={`${styles.tradeCard__body__right} ${styles.center}`}
              >
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.tradeCard__body__left__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <CustomSelect
                      iconList={iconList}
                      onChange={handleBaseTokenChange}
                      list={
                        searchKey.length > 0
                          ? inputOptions2
                          : inputOptions.length > 0
                          ? inputOptions
                          : null
                      }
                      value={baseToken || null}
                      onSearchChange={onSearchChange1}
                      assetMap={assetMap}
                      balances={balances}
                    />
                  </div>
                </div>

                <div>
                  <span className="percentage ml-1">{`${BASE_PERCENTAGE} %`}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${styles.tradeCard__body__item} ${styles.border__radius}`}
          >
            <div className={styles.tradeCard__body__left}>
              <div
                className={`${styles.tradeCard__body__right} ${styles.center}`}
              >
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.tradeCard__body__left__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <CustomSelect
                      iconList={iconList}
                      disabled={!baseToken}
                      onChange={handleQuoteTokenChange}
                      list={
                        searchKey.length > 0
                          ? outputOptions2
                          : outputOptions.length > 0
                          ? outputOptions
                          : null
                      }
                      value={quoteToken || null}
                      onSearchChange={onSearchChange2}
                      assetMap={assetMap}
                      balances={balances}
                    />
                  </div>
                </div>

                <div>
                  <span className="percentage ml-1">{`${QUOTE_PERCENTAGE} %`}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: '',
      content: (
        <>
          <div
            className={`${styles.tradeCard__body__item} ${styles.border__radius}`}
          >
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__right}>
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage
                        src={iconList?.[baseToken]?.coinImageUrl}
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
                    {denomConversion(baseToken)}
                    <div className="pool-denom">{BASE_PERCENTAGE}%</div>
                  </div>
                </div>

                <div className="custom-input-wrap">
                  <div className={styles.tradeCard__body__right__el1}>
                    <div
                      className={`${
                        styles.tradeCard__body__right__el1__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'Available'}
                      <span>
                        {amountConversionWithComma(
                          baseAvailable || 0,
                          assetMap[baseToken]?.decimals
                        )}{' '}
                        {denomConversion(baseToken)}
                      </span>
                    </div>

                    <div className="maxhalf margin">
                      <Button
                        className="active"
                        onClick={() => handleBaseInputMax()}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
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

          <div
            className={`${styles.tradeCard__body__item} ${styles.border__radius}`}
          >
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__right}>
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage
                        src={iconList?.[quoteToken]?.coinImageUrl}
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
                    {denomConversion(quoteToken)}
                    <div className="pool-denom">{QUOTE_PERCENTAGE}%</div>
                  </div>
                </div>

                <div className="custom-input-wrap">
                  <div className={styles.tradeCard__body__right__el1}>
                    <div
                      className={`${
                        styles.tradeCard__body__right__el1__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'Available'}
                      <span className="ml-1">
                        {amountConversionWithComma(
                          quoteAvailable || 0,
                          assetMap[quoteToken]?.decimals
                        )}{' '}
                        {denomConversion(quoteToken)}
                      </span>
                    </div>
                    <div className="maxhalf margin">
                      <Button
                        className="active"
                        onClick={() => handleQuoteInputMax()}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
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
      title: '',
      content: (
        <>
          <div
            className={`${styles.tradeCard__body__item} ${styles.border__radius}`}
          >
            <div className={styles.tradeCard__body__left}>
              <div
                className={`${styles.tradeCard__body__right} ${styles.active}`}
              >
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage
                        src={iconList?.[baseToken]?.coinImageUrl}
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
                    {denomConversion(baseToken)}
                    <div className="pool-denom">{BASE_PERCENTAGE}%</div>
                  </div>
                </div>

                <div className="custom-base-amount">
                  <div className="selected-amount">{baseAmount}</div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${styles.tradeCard__body__item} ${styles.border__radius}`}
          >
            <div className={styles.tradeCard__body__left}>
              <div
                className={`${styles.tradeCard__body__right} ${styles.active}`}
              >
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage
                        src={iconList?.[quoteToken]?.coinImageUrl}
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
                    {denomConversion(quoteToken)}
                    <div className="pool-denom">{QUOTE_PERCENTAGE}%</div>
                  </div>
                </div>

                <div className="custom-base-amount">
                  <div className="selected-amount">{quoteAmount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="checkbox-container mt-3 text-center ml-3">
            <Checkbox onChange={onCheckChange} checked={isAccepted}>
              <p>
                I understand that creating a new pool will cost{' '}
                {`${amountConversionWithComma(
                  params?.poolCreationFee?.[0]?.amount,
                  assetMap[params?.poolCreationFee?.[0]?.denom]?.decimals
                )} 
              ${denomConversion(params?.poolCreationFee?.[0]?.denom)}`}{' '}
              </p>{' '}
            </Checkbox>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={openPoolModal}
        onOk={closePool}
        onCancel={closePool}
        footer={false}
        centered={true}
        className="create-pool-modal"
        closeIcon={<Icon className={'bi bi-x-lg'} />}
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
                    params?.poolCreationFee?.[0]?.amount || 0,
                    assetMap[params?.poolCreationFee?.[0]?.denom]?.decimals
                  )}
                </span>
                <span className="ml-1">
                  {denomConversion(params?.poolCreationFee?.[0]?.denom)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action mt-3">
          {current > 0 && (
            <Button
              style={{
                margin: '0 8px',
                height: '46.216px',
                width: '155.216px',
                borderRadius: '95.907px',
              }}
              type="primary btn-filled2"
              onClick={() => prev()}
            >
              Previous
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button
              disabled={disableConditions}
              style={{
                height: '46.216px',
                width: '155.216px',
                borderRadius: '95.907px',
              }}
              type="primary btn-filled2"
              onClick={() => next()}
            >
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              loading={inProgress}
              disabled={!isAccepted}
              style={{
                height: '46.216px',
                width: '155.216px',
                borderRadius: '95.907px',
              }}
              type="primary btn-filled2"
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
  assetMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  params: PropTypes.shape({
    poolCreationFee: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.string,
        denom: PropTypes.string,
      })
    ),
  }),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    params: state.swap.params,
    assetMap: state.asset.map,
    iconList: state.config?.iconList,
  };
};

const actionsToProps = {
  setPoolTokenSupply,
};

export default connect(stateToProps, actionsToProps)(CreatePoolModal);
