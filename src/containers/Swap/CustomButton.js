import { Button, message } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import Snack from "../../components/common/Snack";
import { APP_ID, DEFAULT_FEE } from "../../constants/common";
import { signAndBroadcastTransaction } from "../../services/helper";
import { queryOrder } from "../../services/liquidity/query";
import {
  amountConversion,
  denomConversion,
  getAmount,
  orderPriceConversion
} from "../../utils/coin";
import { decimalConversion, getExponent } from "../../utils/number";
import variables from "../../utils/variables";

const CustomButton = ({
  offerCoin,
  demandCoin,
  address,
  name,
  isDisabled,
  validationError,
  lang,
  refreshBalance,
  pair,
  orderDirection,
  isLimitOrder,
  limitPrice,
  refreshDetails,
  baseCoinPoolPrice,
  slippageTolerance,
  orderLifespan,
  assetMap,
  baseCoinPoolPriceWithoutConversion,
  params,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const dispatch = useDispatch();

  const poolPrice = Number(baseCoinPoolPriceWithoutConversion);

  const priceWithOutConversion = () => {
    return (
      baseCoinPoolPrice + baseCoinPoolPrice * Number(slippageTolerance / 100)
    );
  };

  const calculateBuyAmount = () => {
    let maxPrice =
      Number(decimalConversion(pair?.lastPrice)) *
      (1 + Number(decimalConversion(params?.maxPriceLimitRatio)));
    const amount =
      ((Number(offerCoin?.amount) - Number(offerCoin?.fee)) / maxPrice) *
      10 **
        Math.abs(
          getExponent(assetMap[pair?.baseCoinDenom]?.decimals) -
            getExponent(assetMap[pair?.quoteCoinDenom]?.decimals)
        );

    return getAmount(amount, assetMap[demandCoin?.denom]?.decimals);
  };

  const calculateOrderPrice = () => {
    if (orderDirection === 1) {
      //order direction buy: price = basecoinpoolprice + 1%
      return orderPriceConversion(
        poolPrice + poolPrice * Number(slippageTolerance / 100)
      );
    } else {
      //order direction sell: price = basecoinpoolprice - 1%
      return orderPriceConversion(
        poolPrice - poolPrice * Number(slippageTolerance / 100)
      );
    }
  };

  const getMessage = (isLimitOrder) => {
    const price = calculateOrderPrice();

    let data = {
      typeUrl: isLimitOrder
        ? "/comdex.liquidity.v1beta1.MsgLimitOrder"
        : "/comdex.liquidity.v1beta1.MsgMarketOrder",
      value: {
        orderer: address,
        orderLifespan: isLimitOrder
          ? { seconds: orderLifespan, nanos: 0 }
          : "0",
        pairId: pair?.id,
        appId: Long.fromNumber(APP_ID),
        direction: orderDirection,
        /** offer_coin specifies the amount of coin the orderer offers */

        offerCoin: {
          denom: offerCoin?.denom,
          amount: getAmount(
            Number(offerCoin?.amount),
            assetMap[offerCoin?.denom]?.decimals
          ),
        },
        demandCoinDenom: demandCoin?.denom,
        /** amount specifies the amount of base coin the orderer wants to buy or sell */
        amount:
          orderDirection === 2
            ? getAmount(
                Number(offerCoin?.amount) - Number(offerCoin?.fee),
                assetMap[offerCoin?.denom]?.decimals
              )
            : calculateBuyAmount(),
      },
    };

    if (isLimitOrder) {
      data.value.price = orderPriceConversion(
        limitPrice *
          10 **
            Math.abs(
              getExponent(assetMap[pair?.baseCoinDenom]?.decimals) -
                getExponent(assetMap[pair?.quoteCoinDenom]?.decimals)
            )
      );
    }
    return data;
  };

  const handleSwap = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: getMessage(isLimitOrder),
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

        if (!isLimitOrder && result?.rawLog && !result?.code) {
          let parsedData = JSON.parse(result?.rawLog)?.[0];

          let order = parsedData?.events?.find(
            (item) => item?.type === "market_order"
          );
          let orderId = order?.attributes?.find(
            (item) => item?.key === "order_id"
          )?.value;
          let pairId = order?.attributes?.find(
            (item) => item?.key === "pair_id"
          )?.value;

          if (orderId && pairId) {
            queryOrder(orderId, pairId, (error, result) => {
              if (error) {
                return;
              }

              let data = result?.order;

              message.success(
                `Received ${amountConversion(
                  data?.receivedCoin?.amount,
                  assetMap[data?.receivedCoin?.denom]?.decimals
                )} ${denomConversion(
                  data?.receivedCoin?.denom
                )} for ${amountConversion(
                  Number(data?.offerCoin?.amount) -
                    Number(data?.remainingOfferCoin?.amount),
                  assetMap[data?.offerCoin?.denom]?.decimals
                )} ${denomConversion(data?.offerCoin?.denom)}`
              );
            });
          }
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        updateValues();
        refreshDetails();
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

  const updateValues = () => {
    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });
    dispatch({
      type: "DEMAND_COIN_AMOUNT_SET",
      value: 0,
    });
    dispatch({
      type: "OFFER_COIN_AMOUNT_SET",
      value: 0,
    });
  };

  return (
    <div className="assets-form-btn">
      <Button
        disabled={
          isDisabled ||
          inProgress ||
          !(offerCoin && Number(offerCoin.amount)) ||
          validationError?.message
        }
        type="primary"
        loading={inProgress}
        className="btn-filled"
        onClick={() => handleSwap()}
      >
        {name}
      </Button>
    </div>
  );
};

CustomButton.propTypes = {
  refreshDetails: PropTypes.func.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  baseCoinPoolPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  baseCoinPoolPriceWithoutConversion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  demandCoin: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    denom: PropTypes.string,
  }),
  isDisabled: PropTypes.bool,
  isLimitOrder: PropTypes.bool,
  inputValue: PropTypes.number,
  limitPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  offerCoin: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    denom: PropTypes.string,
    fee: PropTypes.number,
  }),
  orderLifespan: PropTypes.number,
  params: PropTypes.shape({
    swapFeeRate: PropTypes.string,
  }),
  slippageTolerance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  validationError: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      message: PropTypes.string.isRequired,
    }),
  ]),
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    demandCoin: state.swap.demandCoin,
    offerCoin: state.swap.offerCoin,
    slippageTolerance: state.swap.slippageTolerance,
    refreshBalance: state.account.refreshBalance,
    assetMap: state.asset.map,
    baseCoinPoolPriceWithoutConversion:
      state.liquidity.baseCoinPoolPriceWithoutConversion,
  };
};

export default connect(stateToProps)(CustomButton);
