import * as PropTypes from "prop-types";
import React from "react";
import { denomConversion } from "../../utils/coin";
import { iconNameFromDenom } from "../../utils/string";
import { NextImage } from "../../shared/image/NextImage";
import { connect } from "react-redux";

const PoolCardRow = ({ pool, iconList }) => {

  return (
    <>
      <div className="assets-withicon">
        <div className="assets-icon assets-icon-1">
          <NextImage src={iconList?.[pool?.balances?.baseCoin?.denom]?.coinImageUrl} width={35} height={35} alt="" />
        </div>
        <div className="assets-icon assets-icon-2 ">
          <NextImage src={iconList?.[pool?.balances?.quoteCoin?.denom]?.coinImageUrl} width={35} height={35} alt="" />
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

const actionsToProps = {
 
};

export default connect(stateToProps, actionsToProps)(PoolCardRow);
