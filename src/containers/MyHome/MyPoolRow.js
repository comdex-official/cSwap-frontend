import * as PropTypes from "prop-types";
import React from "react";
import { SvgIcon } from "../../components/common";
import { denomConversion } from "../../utils/coin";
import { iconNameFromDenom } from "../../utils/string";

const PoolCardRow = ({ pool }) => {
  return (
    <>
      <div className="assets-withicon">
        <div className="assets-icon assets-icon-1">
          <SvgIcon
            name={iconNameFromDenom(pool?.balances?.baseCoin?.denom)}
            viewBox="0 0 23.515 31"
          />{" "}
        </div>
        <div className="assets-icon assets-icon-2">
          <SvgIcon name={iconNameFromDenom(pool?.balances?.quoteCoin?.denom)} />{" "}
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
};

export default PoolCardRow;
