import { Button, Form, message, Slider } from "antd";
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
import styles from "../Farm.module.scss"
import PoolDetails from "../poolDetail";

const marks = {
    0: "0",
    50: "50%",
    100: "100%",
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
                className={`${styles.liquidityCard__pool__withdraw__wrap} ${theme === "dark" ? styles.dark : styles.light
                    }`}
            >
                <div
                    className={`${styles.liquidityCard__pool__withdraw__title} ${theme === "dark" ? styles.dark : styles.light
                        }`}
                >
                    {"Amount to Withdraw"}
                </div>
                <div
                    className={`${styles.liquidityCard__pool__input} ${theme === "dark" ? styles.dark : styles.light
                        }`}
                >
                    <RangeTooltipContent />
                </div>
                <div
                    className={`${styles.liquidityCard__pool__withdraw__footer} ${theme === "dark" ? styles.dark : styles.light
                        }`}
                >
                    <div
                        className={`${styles.liquidityCard__pool__withdraw__element} ${theme === "dark" ? styles.dark : styles.light
                            }`}
                    >
                        <div
                            className={`${styles.liquidityCard__pool__withdraw__element__title
                                } ${styles.title} ${theme === "dark" ? styles.dark : styles.light
                                }`}
                        >
                            {"Tokens to be Withdrawn"}
                        </div>
                        <div
                            className={`${styles.liquidityCard__pool__withdraw__element__title
                                } ${theme === "dark" ? styles.dark : styles.light}`}
                        >
                            {"$0.00 ≈ 0 PoolToken"}
                        </div>
                    </div>
                    <div
                        className={`${styles.liquidityCard__pool__withdraw__element} ${theme === "dark" ? styles.dark : styles.light
                            }`}
                    >
                        <div
                            className={`${styles.liquidityCard__pool__withdraw__element__title
                                } ${styles.title} ${theme === "dark" ? styles.dark : styles.light
                                }`}
                        >
                            {"You have"}
                        </div>
                        <div
                            className={`${styles.liquidityCard__pool__withdraw__element__title
                                } ${theme === "dark" ? styles.dark : styles.light}`}
                        >
                            {"$0.00 ≈ 0 PoolToken"}
                        </div>
                    </div>
                </div>
            </div>

            {/* <PoolDetails active={active } pool={pool}/> */}
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
};

const stateToProps = (state) => {
    return {
        lang: state.language,
        address: state.account.address,
        balances: state.account.balances.list,
    };
};

export default connect(stateToProps)(Remove);
