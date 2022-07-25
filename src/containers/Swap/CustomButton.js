import { Button, message } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setComplete } from "../../actions/swap";
import Snack from "../../components/common/Snack";
import { APP_ID, DEFAULT_FEE } from "../../constants/common";
import { signAndBroadcastTransaction } from "../../services/helper";
import { getAmount, orderPriceConversion } from "../../utils/coin";
import variables from "../../utils/variables";

const CustomButton = ({
  offerCoin,
  demandCoin,
  address,
  name,
  isDisabled,
  setComplete,
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
}) => {
  const [inProgress, setInProgress] = useState(false);
  const dispatch = useDispatch();

  const poolPrice = Number(baseCoinPoolPrice);

  useEffect(() => {
    setComplete(false);
  }, []);

  const priceWithOutConversion = () => {
    return poolPrice + poolPrice * Number(slippageTolerance / 100);
  };

  const calculateBuyAmount = () => {
    const price = priceWithOutConversion();
    const amount = Number(offerCoin?.amount) / price;

    return getAmount(amount);
  };

  const calculateOrderPrice = () => {
    if (orderDirection === 1) {
      return orderPriceConversion(
        poolPrice + poolPrice * Number(slippageTolerance / 100)
      );
    } else {
      return orderPriceConversion(
        poolPrice - poolPrice * Number(slippageTolerance / 100)
      );
    }
  };

  const getMessage = (isLimitOrder) => {
    const price = calculateOrderPrice();

    return {
      typeUrl: "/comdex.liquidity.v1beta1.MsgLimitOrder",
      value: {
        orderer: address,
        orderLifespan: isLimitOrder ? { seconds: 600, nanos: 0 } : "0",
        pairId: pair?.id,
        appId: Long.fromNumber(APP_ID),
        direction: orderDirection,
        /** offer_coin specifies the amount of coin the orderer offers */
        offerCoin: {
          denom: offerCoin?.denom,
          amount: getAmount(Number(offerCoin?.amount) + Number(offerCoin?.fee)),
        },
        demandCoinDenom: demandCoin?.denom,
        price: isLimitOrder ? orderPriceConversion(limitPrice) : price,
        /** amount specifies the amount of base coin the orderer wants to buy or sell */
        amount:
          orderDirection === 2
            ? getAmount(offerCoin?.amount)
            : calculateBuyAmount(),
      },
    };
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
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        setComplete(true);
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
  setComplete: PropTypes.func.isRequired,
  address: PropTypes.string,
  baseCoinPoolPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  };
};

const actionsToProps = {
  setComplete,
};

export default connect(stateToProps, actionsToProps)(CustomButton);
