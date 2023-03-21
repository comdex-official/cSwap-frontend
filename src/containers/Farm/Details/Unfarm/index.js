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
import variables from "../../../../utils/variables";
import PoolTokenValue from "../PoolTokenValue";

const marks = {
  0: "0",
  50: "50%",
  100: "100%",
};

const UnFarm = ({
  lang,
  address,
  pool,
  refreshData,
  updateBalance,
  userLockedPoolTokens,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [sliderValue, setSliderValue] = useState();
  const [amount, setAmount] = useState(0);

  const onChange = (value) => {
    setSliderValue(value);
    calculateBondAmount(value);
  };

  const calculateBondAmount = (input) => {
    const amount = (input / 100) * userLockedPoolTokens;
    setAmount(amount);
  };

  const handleClick = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.liquidity.v1beta1.MsgUnfarm",
          value: {
            farmer: address,
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            /** soft_lock_coin specifies coins to stake */
            unfarmingPoolCoin: {
              amount: Number(amount).toFixed(0).toString(),
              denom: pool?.poolCoinDenom,
            },
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        setSliderValue(0);
        setAmount(0);
        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        refreshData(pool);
        updateBalance();
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

  return (
    <div className="common-card">
      <div className="farm-content-card">
        <Form layout="vertical">
          <Row className="mb-3">
            <Col>
              <h2 className="card-titles">Amount to Unfarm</h2>
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
                    disabled={!Number(userLockedPoolTokens)}
                    onChange={onChange}
                    tooltip={{ open: false }}
                  />
                  <CustomInput
                    defaultValue={sliderValue}
                    onChange={(event) => {
                      onChange(event.target?.value);
                    }}
                    placeholder="0"
                    disabled={!Number(userLockedPoolTokens)}
                    value={`${sliderValue}`}
                  />
                  <span className="percent-text">%</span>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="pool_balance p-1 mb-2 pt-1">
            <Col className="label-left">You will unfarm</Col>
            <Col className="text-right">
              <PoolTokenValue poolTokens={amount} /> ≈{" "}
              {Number(amount).toFixed() || 0} PoolToken
            </Col>
          </Row>
          <Row className="pool_balance p-1">
            <Col className="label-left">You farmed</Col>
            <Col className="text-right">
              <PoolTokenValue poolTokens={userLockedPoolTokens} /> ≈{" "}
              {Number(userLockedPoolTokens).toFixed() || 0} PoolToken
            </Col>
          </Row>
          <Row>
            <Col className="text-center mt-5">
              <Button
                onClick={handleClick}
                disabled={
                  !Number(amount) ||
                  !sliderValue ||
                  inProgress ||
                  sliderValue > 100
                }
                loading={inProgress}
                type="primary"
                className="btn-filled px-5"
              >
                {variables[lang].un_farm}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

UnFarm.propTypes = {
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
  bondingData: PropTypes.shape({
    unbondedPoolCoin: PropTypes.string.isRequired,
  }),
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
    reserveCoinDenoms: PropTypes.array,
  }),
  userLockedPoolTokens: PropTypes.number,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pool: state.liquidity.pool._,
    balances: state.account.balances.list,
  };
};

export default connect(stateToProps)(UnFarm);
