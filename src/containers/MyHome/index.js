import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { setPools, setUserLiquidityInPools } from "../../actions/liquidity";
import Balances from "./Balances";

Balances.propTypes = {
  setPools: PropTypes.func.isRequired,
  setUserLiquidityInPools: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  assetBalance: PropTypes.number,
  poolBalance: PropTypes.number,
  isDarkMode: PropTypes.bool.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    poolBalance: state.account.balances.pool,
    isDarkMode: state.theme.theme.darkThemeEnabled,
    address: state.account.address,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
  };
};

const actionsToProps = {
  setPools,
  setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(Balances);
