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
import Info from "../../Info";
import PoolTokenValue from "../PoolTokenValue";

const marks = {
  0: "0",
  50: "50%",
  100: "100%",
};

const Farm = ({
  lang,
  address,
  pool,
  refreshData,
  updateBalance,
  userPoolTokens,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [sliderValue, setSliderValue] = useState();
  const [amount, setAmount] = useState(0);

  const onChange = (value) => {
    setSliderValue(value);
    calculateBondAmount(value);
  };

  const calculateBondAmount = (input) => {
    const amount = (input / 100) * userPoolTokens;
    setAmount(amount);
  };

  const handleClick = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.liquidity.v1beta1.MsgFarm",
          value: {
            farmer: address,
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            /** soft_lock_coin specifies coins to stake */
            farmingPoolCoin: {
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
              <h2 className="card-titles">Amount to Farm</h2>
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
                    disabled={!Number(userPoolTokens)}
                    onChange={onChange}
                    tooltip={{ open: false }}
                  />
                  <CustomInput
                    defaultValue={sliderValue}
                    onChange={(event) => {
                      onChange(event.target?.value);
                    }}
                    disabled={!Number(userPoolTokens)}
                    placeholder="0"
                    value={`${sliderValue}`}
                  />
                  <span className="percent-text">%</span>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="pool_balance p-1 mb-2 pt-1">
            <Col className="label-left">You will farm</Col>
            <Col className="text-right">
              <PoolTokenValue poolTokens={amount} /> ≈{" "}
              {Number(amount).toFixed() || 0} PoolToken
            </Col>
          </Row>
          <Row className="pool_balance p-1">
            <Info />
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
                {variables[lang].farm}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

Farm.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshData: PropTypes.func.isRequired,
  updateBalance: PropTypes.func.isRequired,
  address: PropTypes.string,
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
  userPoolTokens: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pool: state.liquidity.pool._,
  };
};

export default connect(stateToProps)(Farm);
