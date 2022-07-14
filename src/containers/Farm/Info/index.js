import { Col } from "../../../components/common";
import React from "react";
import { getDenomBalance } from "../../../utils/coin";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import PoolTokenValue from "../Details/PoolTokenValue";

const Info = ({ pool, balances }) => {
  const userPoolTokens = getDenomBalance(balances, pool?.poolCoinDenom) || 0;

  return (
    <>
      <Col className="label-left">You have</Col>
      <Col className="text-right">
        <PoolTokenValue poolTokens={userPoolTokens} /> ≈{" "}
        {Number(userPoolTokens).toFixed() || 0} PoolToken
      </Col>
    </>
  );
};

Info.propTypes = {
  lang: PropTypes.string.isRequired,
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
    pool: state.liquidity.pool._,
    balances: state.account.balances.list,
  };
};

export default connect(stateToProps)(Info);
