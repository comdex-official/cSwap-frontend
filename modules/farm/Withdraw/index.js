import { Button, Col, Form, message, Row, Slider } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import Snack from "../../../shared/components/Snack";
import CustomInput from "../../../shared/components/CustomInput";
import { APP_ID } from "../../../constants/common";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { defaultFee } from "../../../services/transaction";
import {
  amountConversion,
  getAmount,
  getDenomBalance,
} from "../../../utils/coin";
import variables from "../../../utils/variables";
import { errorMessageMappingParser } from "../../../utils/string";
import RangeTooltipContent from "../../../shared/components/range/RangedToolTip";
import styles from "../Farm.module.scss";
import PoolTokenValue from "../PoolTokenValue";
import PoolDetails from "../poolDetail";

const marks = {
  0: {
    style: {
      color: "#ffffff",
    },
    label: "0%",
  },
  50: {
    style: {
      color: "#ffffff",
    },
    label: "50%",
  },
  100: {
    style: {
      color: "#ffffff",
    },
    label: "100%",
  },
};

const Remove = ({
  active,
  theme,
  lang,
  pool,
  balances,
  address,
  refreshData,
  updateBalance,
  userLockedPoolTokens,
}) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [removeInProgress, setRemoveInProgress] = useState(false);
  const [amount, setAmount] = useState(0);

  const userPoolTokens = getDenomBalance(balances, pool?.poolCoinDenom) || 0;

  const myLiquidity =
    amountConversion(getDenomBalance(balances, pool?.poolCoinDenom)) || 0;

  const onChange = (value) => {
    setSliderValue(value);
    calculateBondAmount(value);
  };

  const calculateBondAmount = (input) => {
    const amount = (input / 100) * userLockedPoolTokens;
    setAmount(amount);
  };

  const handleWithdrawClick = () => {
    setRemoveInProgress(true);

    signAndBroadcastTransaction(
      {
        // message: {
        //     typeUrl: "/comdex.liquidity.v1beta1.MsgWithdraw",
        //     value: {
        //         withdrawer: address,
        //         poolId: pool?.id,
        //         appId: Long.fromNumber(APP_ID),
        //         poolCoin: {
        //             denom: pool?.poolCoinDenom,
        //             amount: amount,
        //         },
        //     },
        // },
        message: {
          typeUrl: "/comdex.liquidity.v1beta1.MsgUnfarmAndWithdraw",
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
          message.info(errorMessageMappingParser(result?.rawLog));
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
    <>
      <div
        className={`${styles.liquidityCard__pool__withdraw__wrap} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.liquidityCard__pool__withdraw__title} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          {"Amount to Withdraw"}
        </div>
        <div
          className={`${styles.liquidityCard__pool__input} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          {/* <RangeTooltipContent /> */}
          <Row style={{ justifyContent: "space-between" }}>
            <Col span={17}>
              <Slider
                className="comdex-slider-alt"
                marks={marks}
                value={sliderValue}
                max={100}
                min={0}
                onChange={onChange}
                tooltip={{ open: false }}
              />
            </Col>
            <Col span={6}>
              <CustomInput
                defaultValue={sliderValue}
                onChange={(event) => {
                  onChange(event.target?.value);
                }}
                placeholder="0"
                value={`${sliderValue}`}
              />
            </Col>
          </Row>
        </div>
        <div
          className={`${styles.liquidityCard__pool__withdraw__footer} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.liquidityCard__pool__withdraw__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${
                styles.liquidityCard__pool__withdraw__element__title
              } ${styles.title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"You will unfarm"}
            </div>
            <div
              className={`${
                styles.liquidityCard__pool__withdraw__element__title
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {/* {"$0.00 ≈ 0 PoolToken"} */}
              <PoolTokenValue poolTokens={amount} /> ≈{" "}
              {Number(amount).toFixed() || 0} PoolToken
            </div>
          </div>
          <div
            className={`${styles.liquidityCard__pool__withdraw__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${
                styles.liquidityCard__pool__withdraw__element__title
              } ${styles.title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"You farmed"}
            </div>
            <div
              className={`${
                styles.liquidityCard__pool__withdraw__element__title
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {/* {"$0.00 ≈ 0 PoolToken"} */}
              <PoolTokenValue poolTokens={userLockedPoolTokens} /> ≈{" "}
              {Number(userLockedPoolTokens).toFixed() || 0} PoolToken
            </div>
          </div>
        </div>
      </div>
      <PoolDetails active={active} pool={pool} />

      <div className={styles.farm__deposit__buttonWrap}>
        <Button
          onClick={handleWithdrawClick}
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
          UnFarm & Withdraw
        </Button>
      </div>
    </>
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
  userLockedPoolTokens: PropTypes.number,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    balances: state.account.balances.list,
  };
};

export default connect(stateToProps)(Remove);
