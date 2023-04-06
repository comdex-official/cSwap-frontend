import { Button, Input, message } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Col, Row } from "../../components/common";
import { APP_ID, DEFAULT_FEE } from "../../constants/common";
import { signAndBroadcastTransaction } from "../../services/helper";
import {
  amountConversion,
  denomConversion,
  getAmount,
  getDenomBalance,
  orderPriceConversion
} from "../../utils/coin";
import {
  decimalConversion,
  formateNumberDecimalsAuto,
  marketPrice
} from "../../utils/number";
import "./index.scss";
import OrderType from "./OrderType";

const Buy = ({ pair, balances, markets, address, params, type }) => {
  const [price, setPrice] = useState();
  const [amount, setAmount] = useState();
  const [total, setTotal] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    setPrice(
      formateNumberDecimalsAuto({
        price: pair?.price || 0,
      })
    );
  }, [pair]);

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
      typeUrl: type === "limit"?
             "/comdex.liquidity.v1beta1.MsgLimitOrder"
            : "/comdex.liquidity.v1beta1.MsgMarketOrder",
      value: {
        orderer: address,
        orderLifespan: type === "limit"? { seconds: 21600, nanos: 0 } : "0",
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

    if(type === "limit") {
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

  const handleAmountChange = (value) => {
    setAmount(value);
    setTotal(value * price);
  };

  const handleAmountPercentage = (value) => {
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
        <div className="avai-balance-dtl">
          <p>Available Balance</p>
          <h4>
            {formateNumberDecimalsAuto({
              price: amountConversion(quoteBalance || 0),
            })}{" "}
            {denomConversion(pair?.quote_coin_denom)}
          </h4>
          <label>
            =$
            {formateNumberDecimalsAuto({ price: getBalanceValue() || 0 })}
          </label>
        </div>
        <div className="price-dtl">
          <div className="price-dtl-row">
            <label>Price</label>
            {type === "market" ? (
              <div className="market-text">Market Price</div>
            ) : (
              <Input
                type={"number"}
                value={price}
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
          <div className="price-dtl-row">
            <label>Amount</label>
            <Input
              value={amount}
              placeholder="0"
              onChange={(event) => handleAmountChange(event.target.value)}
              suffix={denomConversion(pair?.base_coin_denom)}
            />
          </div>
          <div className="btn-row">
            <Button onClick={() => handleAmountPercentage(10)}>10%</Button>
            <Button onClick={() => handleAmountPercentage(25)}>25%</Button>
            <Button onClick={() => handleAmountPercentage(50)}>50%</Button>
            <Button onClick={() => handleAmountPercentage(100)}>100%</Button>
          </div>
        </div>
        {type === "market" ? null : (
          <Row className="total-row">
            <Col className="total-title">Total</Col>
            <Col className="total-right">
              <p>
                {formateNumberDecimalsAuto({
                  price: total || 0,
                })}{" "}
                {denomConversion(pair?.quote_coin_denom)}
              </p>
              <label>
                =${Number(total) * marketPrice(markets, pair?.quote_coin_denom)}
              </label>
            </Col>
          </Row>
        )}
        <Row className="mt-4 pt-2">
          <Col>
            <Button
              type="primary"
              className="btn-filled"
              size="large"
              block
              loading={inProgress}
              disabled={inProgress || !price || !total}
              onClick={() => handleSwap()}
            >
              Buy {denomConversion(pair?.base_coin_denom)}
            </Button>
          </Col>
        </Row>
      </div>
    </>
  );
};

Buy.propTypes = {
  address: PropTypes.string,
  type: PropTypes.string,
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
