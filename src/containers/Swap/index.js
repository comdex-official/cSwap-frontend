import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  setDemandCoinAmount,
  setDemandCoinDenom,
  setOfferCoinAmount,
  setOfferCoinDenom,
  setReverse,
  setSlippage,
  setParams,
  setSlippageTolerance,
  setLimitOrderToggle,
  setLimitPrice,
} from "../../actions/swap";
import {
  setPool,
  setPoolBalance,
  setPools,
  setBaseCoinPoolPrice,
  setPoolPrice,
} from "../../actions/liquidity";
import { setPairs, setPair } from "../../actions/asset";
import Swap from "./Swap";

Swap.propTypes = {
  setBaseCoinPoolPrice: PropTypes.func.isRequired,
  setOfferCoinDenom: PropTypes.func.isRequired,
  setOfferCoinAmount: PropTypes.func.isRequired,
  setDemandCoinAmount: PropTypes.func.isRequired,
  setLimitOrderToggle: PropTypes.func.isRequired,
  setLimitPrice: PropTypes.func.isRequired,
  setParams: PropTypes.func.isRequired,
  setPoolPrice: PropTypes.func.isRequired,
  setSlippage: PropTypes.func.isRequired,
  setSlippageTolerance: PropTypes.func.isRequired,
  setPair: PropTypes.func.isRequired,
  setPairs: PropTypes.func.isRequired,
  setPool: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setPools: PropTypes.func.isRequired,
  setReverse: PropTypes.func.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  baseCoinPoolPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  demandCoin: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    denom: PropTypes.string,
  }),
  handleSet: PropTypes.func,
  isLimitOrder: PropTypes.bool,
  lang: PropTypes.string,
  limitPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  pair: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    baseCoinDenom: PropTypes.string,
    quoteCoinDenom: PropTypes.string,
  }),
  pairs: PropTypes.shape({
    list: PropTypes.arrayOf(
      PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
        liquidationRatio: PropTypes.string,
        id: PropTypes.shape({
          high: PropTypes.number,
          low: PropTypes.number,
          unsigned: PropTypes.bool,
        }),
      })
    ),
  }),
  params: PropTypes.shape({
    swapFeeRate: PropTypes.string,
  }),
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
  poolBalance: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    })
  ),
  poolPriceMap: PropTypes.object,
  pools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      reserveAccountAddress: PropTypes.string,
      poolCoinDenom: PropTypes.string,
      reserveCoinDenoms: PropTypes.array,
    })
  ),
  reverse: PropTypes.bool,
  slippageTolerance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  slippage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    markets: state.oracle.market.list,
    demandCoin: state.swap.demandCoin,
    offerCoin: state.swap.offerCoin,
    reverse: state.swap.reverse,
    balances: state.account.balances.list,
    pools: state.liquidity.pool.list,
    slippage: state.swap.slippage,
    pairs: state.asset.pairs,
    pair: state.asset.pair,
    pool: state.liquidity.pool._,
    poolBalance: state.liquidity.poolBalance,
    params: state.swap.params,
    slippageTolerance: state.swap.slippageTolerance,
    isLimitOrder: state.swap.isLimitOrder,
    limitPrice: state.swap.limitPrice,
    baseCoinPoolPrice: state.liquidity.baseCoinPoolPrice,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

const actionsToProps = {
  setDemandCoinDenom,
  setPool,
  setOfferCoinAmount,
  setOfferCoinDenom,
  setDemandCoinAmount,
  setPoolBalance,
  setReverse,
  setPools,
  setSlippage,
  setPairs,
  setPair,
  setParams,
  setSlippageTolerance,
  setLimitOrderToggle,
  setLimitPrice,
  setBaseCoinPoolPrice,
  setPoolPrice,
};

export default connect(stateToProps, actionsToProps)(Swap);
