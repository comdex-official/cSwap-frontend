import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import {setPools, setUserLiquidityInPools} from "../../actions/liquidity";
import Balances from "./Balances";

Balances.propTypes = {
  setPools: PropTypes.func.isRequired,
  setUserLiquidityInPools: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  assetBalance: PropTypes.number,
  cAssetBalance: PropTypes.number,
  collateralBalance: PropTypes.number,
  debtBalance: PropTypes.number,
  poolBalance: PropTypes.number,
  isDarkMode: PropTypes.bool.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      symbol: PropTypes.string,
      script_id: PropTypes.string,
    })
  ),
  poolPriceMap: PropTypes.object,
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    cAssets: state.account.balances.cAssets,
    cAssetBalance: state.account.balances.cAsset,
    assetBalance: state.account.balances.asset,
    poolBalance: state.account.balances.pool,
    collateralBalance: state.account.balances.collateral,
    debtBalance: state.account.balances.debt,
    isDarkMode: state.theme.theme.darkThemeEnabled,
    address: state.account.address,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

const actionsToProps = {
  setPools,
  setUserLiquidityInPools
};

export default connect(stateToProps, actionsToProps)(Balances);
