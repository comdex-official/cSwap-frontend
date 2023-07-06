import { Button, Col, Input, Row, message } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { APP_ID, DEFAULT_FEE } from "../../constants/common";
import { signAndBroadcastTransaction } from "../../services/helper";
import {
  amountConversion,
  denomConversion,
  getAmount,
  getDenomBalance,
  orderPriceConversion,
} from "../../utils/coin";
import {
  decimalConversion,
  formateNumberDecimalsAuto,
  marketPrice,
} from "../../utils/number";
import OrderType from "./OrderType";
import styles from "./OrderBook.module.scss";

const Buy = ({
  pair,
  balances,
  markets,
  orderLifespan,
  address,
  params,
  type,
  clickedValue,
  setRefresh,
  refresh,
}) => {
  const theme = "dark";
  const [price, setPrice] = useState();
  const [amount, setAmount] = useState();
  const [total, setTotal] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    setPrice(
      formateNumberDecimalsAuto({
        price: clickedValue ? clickedValue : pair?.price || 0,
      })
    );
  }, [pair, clickedValue]);

  const calculateBuyAmount = () => {
    let swapFeeRate = Number(decimalConversion(params?.swapFeeRate));
    const offerCoinFee = amount * swapFeeRate;

    let maxPrice =
      Number(pair?.price) *
      (1 + Number(decimalConversion(params?.maxPriceLimitRatio)));
    const buyAmount =
      ((Number(total) - Number(offerCoinFee)) / maxPrice) *
      10 ** Math.abs(pair?.base_coin_exponent - pair?.quote_coin_exponent);

    return getAmount(buyAmount, 10 ** pair?.base_coin_exponent);
  };

  const getMessage = () => {
    let data = {
      typeUrl:
        type === "limit"
          ? "/comdex.liquidity.v1beta1.MsgLimitOrder"
          : "/comdex.liquidity.v1beta1.MsgMarketOrder",
      value: {
        orderer: address,
        orderLifespan:
          type === "limit" ? { seconds: orderLifespan, nanos: 0 } : "0",
        pairId: Long.fromNumber(pair?.pair_id),
        appId: Long.fromNumber(APP_ID),
        direction: 1,
        /** offer_coin specifies the amount of coin the orderer offers */

        offerCoin: {
          denom: pair?.quote_coin_denom,
          amount: getAmount(Number(total), 10 ** pair?.quote_coin_exponent),
        },
        demandCoinDenom: pair?.base_coin_denom,
        /** amount specifies the amount of base coin the orderer wants to buy or sell */
        amount: calculateBuyAmount(),
      },
    };

    if (type === "limit") {
      data.value.price = orderPriceConversion(
        price *
          10 ** Math.abs(pair?.base_coin_exponent - pair?.quote_coin_exponent)
      );
    }

    return data;
  };

  const handleSwap = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: getMessage(),
        fee: {
          amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
          gas: "500000",
        },
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        setRefresh(!refresh);
        if (error) {
          message.error(error?.rawLog || error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }
        message.success("Transaction success");
        updateValues();
       
      }
    );
  };

  const updateValues = () => {
    setPrice();
    setAmount();
    setTotal();
  };

  const handlePriceChange = (value) => {
    setPrice(value);
    setTotal(amount * price);
  };
  const [active, setActive] = useState();
  const handleAmountChange = (value) => {
    setAmount(value);
    setTotal(value * price);
  };

  const handleAmountPercentage = (value) => {
    setActive(+value);
    let AmountPercentage = (value / 100) * amountConversion(quoteBalance);
    setTotal(AmountPercentage || 0);
    setAmount(AmountPercentage * pair?.price);
  };

  const quoteBalance = getDenomBalance(balances, pair?.quote_coin_denom);

  const getBalanceValue = () => {
    return (
      Number(amountConversion(quoteBalance || 0)) *
      marketPrice(markets, pair?.quote_coin_denom)
    );
  };

  return (
    <>
      <div className="spot-card-dtl">
        <OrderType />
        <div
          className={`${styles.orderbook__body__tab__body} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__body__tab__body__balance} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            Balance:
            {formateNumberDecimalsAuto({
              price: amountConversion(quoteBalance || 0),
            })}{" "}
            {denomConversion(pair?.quote_coin_denom)}
            <label>
              ~$
              {formateNumberDecimalsAuto({ price: getBalanceValue() || 0 })}
            </label>
          </div>

          <div
            className={`${styles.orderbook__body__tab__body__input__wrap} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__body__tab__body__input__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"Price"}
            </div>
            <div
              className={`${styles.orderbook__body__tab__body__input} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {type === "market" ? (
                <div
                  className={`${styles.orderbook__body__tab__body__balance} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  Market Price
                </div>
              ) : (
                <Input
                  type={"number"}
                  value={price}
                  className="order_input"
                  step={
                    1 /
                    10 **
                      formateNumberDecimalsAuto({
                        price: pair?.price || 0,
                      })
                        .toString()
                        ?.split(".")[1]?.length
                  }
                  placeholder="0"
                  onChange={(event) => handlePriceChange(event.target.value)}
                />
              )}
            </div>
          </div>
          <div
            className={`${styles.orderbook__body__tab__body__input__wrap} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__body__tab__body__input__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"Quantity"}
            </div>
            <div
              className={`${styles.orderbook__body__tab__body__input} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <Input
                value={amount}
                className="order_input2"
                placeholder="0"
                onChange={(event) => handleAmountChange(event.target.value)}
                suffix={denomConversion(pair?.base_coin_denom)}
              />
            </div>
          </div>

          <div
            className={`${styles.orderbook__body__tab__footer} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__body__tab__footer__element}
              ${active === 10 ? styles.active : ""}
              ${theme === "dark" ? styles.dark : styles.light}`}
              onClick={() => handleAmountPercentage(10)}
            >
              {"10%"}
            </div>
            <div
              className={`${styles.orderbook__body__tab__footer__element}   ${
                active === 25 ? styles.active : ""
              } ${theme === "dark" ? styles.dark : styles.light}`}
              onClick={() => handleAmountPercentage(25)}
            >
              {"25%"}
            </div>
            <div
              className={`${styles.orderbook__body__tab__footer__element}   ${
                active === 50 ? styles.active : ""
              } ${theme === "dark" ? styles.dark : styles.light}`}
              onClick={() => handleAmountPercentage(50)}
            >
              {"50%"}
            </div>
            <div
              className={`${styles.orderbook__body__tab__footer__element}   ${
                active === 100 ? styles.active : ""
              } ${theme === "dark" ? styles.dark : styles.light}`}
              onClick={() => handleAmountPercentage(100)}
            >
              {"100%"}
            </div>
          </div>
        </div>
        {type === "market" ? null : (
          <div className={`${styles.total__row}`}>
            <div className={`${styles.total__title}`}>Total</div>
            <div className={`${styles.orderbook__body__tab__body__balance}`}>
              <p>
                {formateNumberDecimalsAuto({
                  price: total || 0,
                })}{" "}
                {denomConversion(pair?.quote_coin_denom)}
              </p>
              <label>
                ~${Number(total) * marketPrice(markets, pair?.quote_coin_denom)}
              </label>
            </div>
          </div>
        )}

        <div
          className={`${styles.orderbook__body__tab__button} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <Button
            type="primary"
            className="btn-filled2"
            style={{width: "120px"}}
            block
            loading={inProgress}
            disabled={inProgress || !price || !total}
            onClick={() => handleSwap()}
          >
            {type === "limit"
              ? "Buy"
              : `Buy ${denomConversion(pair?.base_coin_denom)}`}
          </Button>
        </div>
      </div>
    </>
  );
};

Buy.propTypes = {
  address: PropTypes.string,
  type: PropTypes.string,
  orderLifespan: PropTypes.number,
  params: PropTypes.shape({
    swapFeeRate: PropTypes.string,
    maxPriceLimitRatio: PropTypes.string,
  }),
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    params: state.swap.params,
    type: state.order.type,
  };
};

export default connect(stateToProps)(Buy);
