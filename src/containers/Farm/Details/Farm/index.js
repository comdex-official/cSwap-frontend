import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import React, { useState } from "react";
import { Button, Form, message, Slider } from "antd";
import variables from "../../../../utils/variables";
import CustomInput from "../../../../components/CustomInput";
import { Row, Col } from "../../../../components/common";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { defaultFee } from "../../../../services/transaction";
import Snack from "../../../../components/common/Snack";
import Info from "../../Info";
import { getDenomBalance } from "../../../../utils/coin";
import { APP_ID, DOLLAR_DECIMALS } from "../../../../constants/common";
import { commaSeparator } from "../../../../utils/number";
import Long from "long";
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
  balances,
  aprMap,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [sliderValue, setSliderValue] = useState();
  const [amount, setAmount] = useState(0);

  const userPoolBalance = getDenomBalance(balances, pool?.poolCoinDenom) || 0;

  const onChange = (value) => {
    setSliderValue(value);
    calculateBondAmount(value);
  };

  const calculateBondAmount = (input) => {
    const amount = (input / 100) * userPoolBalance;
    setAmount(amount);
  };

  const handleClick = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.liquidity.v1beta1.MsgTokensSoftLock",
          value: {
            depositor: address,
            poolId: pool?.id,
            appId: Long.fromNumber(APP_ID),
            /** soft_lock_coin specifies coins to stake */
            softLockCoin: {
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
          <Row>
            <Col>
              <label className="card-title-label">{variables[lang].apr}</label>
              <h2 className="card-titles">
                {aprMap[pool?.id?.low]
                  ? `${commaSeparator(
                      Number(aprMap[pool?.id?.low]).toFixed(DOLLAR_DECIMALS)
                    )}%`
                  : "-"}
              </h2>
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
                    disabled={!Number(userPoolBalance)}
                    onChange={onChange}
                    tooltipVisible={false}
                  />
                  <CustomInput
                    defaultValue={sliderValue}
                    onChange={(event) => {
                      onChange(event.target?.value);
                    }}
                    disabled={!Number(userPoolBalance)}
                    placeholder="0"
                    value={`${sliderValue}`}
                  />
                  <span className="percent-text">%</span>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="pool_balance p-1 mb-2">
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
  aprMap: PropTypes.object,
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
    reserveCoinDenoms: PropTypes.array,
  }),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pool: state.liquidity.pool._,
    balances: state.account.balances.list,
    aprMap: state.liquidity.aprMap,
  };
};

export default connect(stateToProps)(Farm);
