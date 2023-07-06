import { Button, Col, Form, message, Row, Slider, Tooltip } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import Snack from "../../../shared/components/Snack";
import CustomInput from "../../../shared/components/CustomInput";
import {
  APP_ID,
  DOLLAR_DECIMALS,
  PRICE_DECIMALS,
} from "../../../constants/common";
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
import { Icon } from "../../../shared/image/Icon";
import { decimalConversion, rangeToPercentage } from "../../../utils/number";

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
  const marks = {
    0: Number(decimalConversion(pool?.minPrice)).toFixed(DOLLAR_DECIMALS),
    100: Number(decimalConversion(pool?.maxPrice)).toFixed(DOLLAR_DECIMALS),
  };

  const marks2 = {
    0: "0%",
    50: "50%",
    100: "100%",
  };

  const [sliderValue, setSliderValue] = useState(0);
  const [removeInProgress, setRemoveInProgress] = useState(false);
  const [unfarmProgress, setUnfarmProgress] = useState(false);
  const [withdrawProgress, setWithdrawProgress] = useState(false);
  const [amount, setAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const myLiquidity =
    amountConversion(getDenomBalance(balances, pool?.poolCoinDenom)) || 0;

  const userPoolBalance = getDenomBalance(balances, pool?.poolCoinDenom) || 0;

  const onChange = (value) => {
    setSliderValue(value);
    calculateBondAmount(value);
    calculateAmount(value);
  };

  const calculateBondAmount = (input) => {
    const amount = (input / 100) * userLockedPoolTokens;
    setAmount(amount);
  };

  const calculateAmount = (input) => {
    const amount = (input / 100) * myLiquidity;
    setWithdrawAmount(amount && getAmount(amount));
  };

  const handleUnfarmWithdrawClick = () => {
    setRemoveInProgress(true);

    signAndBroadcastTransaction(
      {
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
        setWithdrawAmount();

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

  const handleUnfarmClick = () => {
    setUnfarmProgress(true);

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
        setUnfarmProgress(false);
        setSliderValue();
        setAmount();
        setWithdrawAmount();
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

  const handleWithdrawClick = () => {
    setWithdrawProgress(true);

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
              amount: withdrawAmount,
            },
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setWithdrawProgress(false);
        refreshData(pool);
        updateBalance();
        setSliderValue();
        setAmount();
        setWithdrawAmount();

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

  return (
    <>
      <div className="ranged-box">
        <div className="ranged-box-inner">
          {pool?.type === 2 ? (
            <div className="farm-rang-slider">
              <div className="farmrange-title">
                {Number(pool?.price) > Number(pool?.minPrice) &&
                Number(pool?.price) < Number(pool?.maxPrice) ? (
                  <span className="success-color">In range</span>
                ) : (
                  <span className="warn-color">Out of range</span>
                )}
                <Tooltip
                  overlayClassName="ranged-tooltip"
                  title={
                    <RangeTooltipContent
                      price={Number(decimalConversion(pool?.price)).toFixed(
                        PRICE_DECIMALS
                      )}
                      max={Number(decimalConversion(pool?.maxPrice)).toFixed(
                        PRICE_DECIMALS
                      )}
                      min={Number(decimalConversion(pool?.minPrice)).toFixed(
                        PRICE_DECIMALS
                      )}
                    />
                  }
                  placement="bottom"
                  autoAdjustOverflow={false}
                >
                  <>
                    <Icon className={"bi bi-info-circle"} />
                  </>
                </Tooltip>
              </div>
              <div className="ranged">
                <Slider
                  className="farm-slider farm-slider-small"
                  tooltip={{ open: false }}
                  value={rangeToPercentage(
                    Number(decimalConversion(pool?.minPrice)),
                    Number(decimalConversion(pool?.maxPrice)),
                    Number(decimalConversion(pool?.price))
                  )}
                  marks={marks}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
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
                marks={marks2}
                value={sliderValue}
                max={100}
                min={0}
                onChange={onChange}
                tooltip={{ open: false }}
              />
            </Col>
            <Col
              span={6}
              style={{ display: "flex", alignItems: "center", gap: "2px" }}
            >
              <CustomInput
                defaultValue={sliderValue}
                onChange={(event) => {
                  onChange(event.target?.value);
                }}
                placeholder="0"
                value={`${sliderValue}`}
              />
              {"%"}
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
              {"Your current farming balance"}
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
          type="primary"
          className="btn-filled2 btn-width-fixed"
          disabled={
            !sliderValue ||
            sliderValue > 100 ||
            !Number(userLockedPoolTokens) ||
            unfarmProgress
          }
          loading={unfarmProgress}
          onClick={() => handleUnfarmClick()}
        >
          Unfarm
        </Button>
        <Button
          type="primary"
          className="btn-filled2 btn-width-fixed"
          disabled={
            !sliderValue ||
            sliderValue > 100 ||
            withdrawProgress ||
            !Number(userPoolBalance)
          }
          loading={withdrawProgress}
          onClick={() => handleWithdrawClick()}
        >
          Withdraw
        </Button>
        <Button
          onClick={() => handleUnfarmWithdrawClick()}
          type="primary"
          disabled={
            !sliderValue ||
            removeInProgress ||
            sliderValue > 100 ||
            !Number(userLockedPoolTokens)
          }
          loading={removeInProgress}
          className="btn-filled2 btn-width-fixed"
        >
          Unfarm & Withdraw
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
