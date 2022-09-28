import { Button, Form, message, Slider } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import { Col, Row } from "../../../../components/common";
import Snack from "../../../../components/common/Snack";
import CustomInput from "../../../../components/CustomInput";
import { APP_ID } from "../../../../constants/common";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { defaultFee } from "../../../../services/transaction";
import {
  amountConversion,
  getAmount,
  getDenomBalance
} from "../../../../utils/coin";
import variables from "../../../../utils/variables";
import Info from "../../Info";
import PoolTokenValue from "../PoolTokenValue";

const marks = {
  0: "0",
  50: "50%",
  100: "100%",
};

const Remove = ({
  lang,
  pool,
  balances,
  address,
  refreshData,
  updateBalance,
}) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [removeInProgress, setRemoveInProgress] = useState(false);
  const [amount, setAmount] = useState();

  const myLiquidity =
    amountConversion(getDenomBalance(balances, pool?.poolCoinDenom)) || 0;

  const onChange = (value) => {
    setSliderValue(value);
    calculateAmount(value);
  };

  const calculateAmount = (input) => {
    const amount = (input / 100) * myLiquidity;

    setAmount(amount && getAmount(amount));
  };

  const handleClick = () => {
    setRemoveInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.liquidity.v1beta1.MsgWithdraw",
          value: {
            withdrawer: address,
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            poolCoin: {
              denom: pool?.poolCoinDenom,
              amount: amount,
            },
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setRemoveInProgress(false);
        setSliderValue();
        setAmount();
        refreshData(pool);
        updateBalance();

        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

  const userPoolBalance = getDenomBalance(balances, pool?.poolCoinDenom) || 0;

  return (
    <div className="common-card">
      <div className="farm-content-card">
        <Form layout="vertical">
          <Row className="mb-3">
            <Col>
              <h2 className="card-titles">Amount to Withdraw</h2>
            </Col>
          </Row>
          <Row className="mb-5">
            <Col>
              <div className="slider-bar mt-4 pb-4">
                <div className="slider-numbers remove-liquidity-slider">
                  <Slider
                    className="comdex-slider-alt"
                    marks={marks}
                    value={sliderValue}
                    max={100}
                    min={0}
                    onChange={onChange}
                    tooltip={{ open: false }}
                  />
                  <CustomInput
                    defaultValue={sliderValue}
                    onChange={(event) => {
                      onChange(event.target?.value);
                    }}
                    placeholder="0"
                    value={`${sliderValue}`}
                  />
                  <span className="percent-text">%</span>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="pool_balance p-1 mb-2 pt-1">
            <Col className="label-left">Tokens to be withdrawn</Col>
            <Col className="text-right">
              <PoolTokenValue poolTokens={amount || 0} /> ≈ {amount || 0}{" "}
              PoolToken
            </Col>
          </Row>
          <Row className="pool_balance p-1">
            <Info />
          </Row>
          <Row>
            <Col className="text-center mt-5">
              <Button
                onClick={handleClick}
                type="primary"
                disabled={
                  !sliderValue ||
                  removeInProgress ||
                  sliderValue > 100 ||
                  !userPoolBalance
                }
                loading={removeInProgress}
                className="btn-filled px-4"
              >
                Remove Liquidity
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

Remove.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshData: PropTypes.func.isRequired,
  updateBalance: PropTypes.func.isRequired,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
  }),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pool: state.liquidity.pool._,
    balances: state.account.balances.list,
  };
};

export default connect(stateToProps)(Remove);
