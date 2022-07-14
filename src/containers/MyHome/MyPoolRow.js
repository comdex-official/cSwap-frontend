import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { denomConversion } from "../../utils/coin";
import { SvgIcon } from "../../components/common";
import { iconNameFromDenom } from "../../utils/string";
import { queryLiquidityPair } from "../../services/liquidity/query";

const PoolCardRow = ({ pool }) => {
  const [pair, setPair] = useState();

  useEffect(() => {
    if (pool?.pairId) {
      queryLiquidityPair(pool?.pairId, (error, result) => {
        if (!error) {
          setPair(result?.pair);
        }
      });
    }
  }, [pool]);

  return (
    <>
      <div className="assets-withicon">
        <div className="assets-icon assets-icon-1">
          <SvgIcon
            name={iconNameFromDenom(pair?.baseCoinDenom)}
            viewBox="0 0 23.515 31"
          />{" "}
        </div>
        <div className="assets-icon assets-icon-2">
          <SvgIcon name={iconNameFromDenom(pair?.quoteCoinDenom)} />{" "}
        </div>
        {denomConversion(pair?.baseCoinDenom)}-
        {denomConversion(pair?.quoteCoinDenom)}
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
