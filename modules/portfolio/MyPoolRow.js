import * as PropTypes from "prop-types";
import React from "react";
import { denomConversion } from "../../utils/coin";
import { iconNameFromDenom } from "../../utils/string";
import { NextImage } from "../../shared/image/NextImage";
import { connect } from "react-redux";
import styles from "./Portfolio.module.scss";
const PoolCardRow = ({ pool, iconList }) => {
  const theme = "dark";
  return (
    <>
      <div className="assets-withicon">
        <div className="assets-icon assets-icon-1">
          <div
            className={`${styles.farmCard__element__left__logo} ${
              styles.first
            } ${theme === "dark" ? styles.dark : styles.light}`}
          >
            <div
              className={`${styles.farmCard__element__left__logo__main} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <NextImage
                src={iconList?.[pool?.balances?.baseCoin?.denom]?.coinImageUrl}
                width={35}
                height={35}
                alt=""
              />
            </div>
          </div>
        </div>
        <div className="assets-icon assets-icon-2 ">
          <div
            className={`${styles.farmCard__element__left__logo} ${
              styles.first
            } ${theme === "dark" ? styles.dark : styles.light}`}
          >
            <div
              className={`${styles.farmCard__element__left__logo__main} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <NextImage
                src={iconList?.[pool?.balances?.quoteCoin?.denom]?.coinImageUrl}
                width={35}
                height={35}
                alt=""
              />
            </div>
          </div>
        </div>
        {denomConversion(pool?.balances?.baseCoin?.denom)}-
        {denomConversion(pool?.balances?.quoteCoin?.denom)}
      </div>
    </>
  );
};

PoolCardRow.propTypes = {
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
  iconList: PropTypes.object,
};
const stateToProps = (state) => {
  return {
    iconList: state.config?.iconList,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(PoolCardRow);
