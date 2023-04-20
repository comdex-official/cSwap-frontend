import * as PropTypes from "prop-types";
import React from "react";
import IconFromDenom from "../../components/common/IconFromDenom";
import { denomConversion } from "../../utils/coin";
const PoolCardRow = ({ pool }) => {
  return (
    <>
      <div className="assets-withicon">
        <div className="assets-icon assets-icon-1">
          <IconFromDenom denom={pool?.balances?.baseCoin?.denom} />
        </div>
        <div className="assets-icon assets-icon-2">
          <IconFromDenom denom={pool?.balances?.quoteCoin?.denom} />
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
