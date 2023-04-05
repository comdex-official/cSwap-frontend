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

const Sell = ({ pair, balances, markets, address, params }) => {
  const [price, setPrice] = useState();
  const [amount, setAmount] = useState();
  const [total, setTotal] = useState(0);
  const [inProgress, setInProgress] = useState(false);
  const available = getDenomBalance(balances, pair?.base_coin_denom);

  useEffect(() => {
    setPrice(
      formateNumberDecimalsAuto({
        price: pair?.price || 0,
      })
    );
  }, [pair]);

  let swapFeeRate = Number(decimalConversion(params?.swapFeeRate));
  const offerCoinFee = amount * swapFeeRate;

  const getMessage = () => {
    let data = {
      typeUrl: "/comdex.liquidity.v1beta1.MsgLimitOrder",
      value: {
        orderer: address,
        orderLifespan: { seconds: 21600, nanos: 0 },
        pairId: Long.fromNumber(pair?.pair_id),
        appId: Long.fromNumber(APP_ID),
        direction: 2,
        /** offer_coin specifies the amount of coin the orderer offers */

        offerCoin: {
          denom: pair?.base_coin_denom,
          amount: getAmount(Number(amount), 10 ** pair?.base_coin_exponent),
        },
        demandCoinDenom: pair?.quote_coin_denom,
        /** amount specifies the amount of base coin the orderer wants to buy or sell */
        amount: getAmount(
          Number(amount) - Number(offerCoinFee),
          10 ** pair?.base_coin_exponent
        ),
      },
    };

    data.value.price = orderPriceConversion(
      price *
        10 ** Math.abs(pair?.base_coin_exponent - pair?.quote_coin_exponent)
    );

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
    setTotal(amount * value);
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    setTotal(value * price);
  };

  const handleAmountPercentage = (value) => {
    let amountPercentage = (value / 100) * amountConversion(available);

    setAmount(amountPercentage || 0);
    setTotal(amountPercentage * pair?.price);
  };

  const getBalanceValue = () => {
    return (
      Number(amountConversion(available || 0)) *
      marketPrice(markets, pair?.base_coin_denom)
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
              price: amountConversion(available || 0),
            })}{" "}
            {denomConversion(pair?.base_coin_denom)}
          </h4>
          <label>
            =$
            {formateNumberDecimalsAuto({ price: getBalanceValue() || 0 })}
          </label>
        </div>
        <div className="price-dtl">
          <div className="price-dtl-row">
            <label>Price</label>
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
        <Row className="mt-4 pt-2">
          <Col>
            <Button type="primary" size="large" block>
              Reset
            </Button>
          </Col>
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
              Sell {denomConversion(pair?.base_coin_denom)}
            </Button>
          </Col>
        </Row>
      </div>
    </>
  );
};

Sell.propTypes = {
  address: PropTypes.string,
  params: PropTypes.shape({
    swapFeeRate: PropTypes.string,
    maxPriceLimitRatio: PropTypes.string,
  }),
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    params: state.swap.params,
  };
};

export default connect(stateToProps)(Sell);
