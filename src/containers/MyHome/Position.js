import * as PropTypes from "prop-types";
import { denomConversion } from "../../utils/coin";
import variables from "../../utils/variables";
import { queryAllBalances, querySupply } from "../../services/bank/query";
import { amountConversion } from "../../utils/coin";
import { useEffect, useState } from "react";
import {
  DOLLAR_DECIMALS,
} from "../../constants/common";
import { marketPrice } from "../../utils/number";
import { setPoolBalances } from "../../actions/liquidity";
import { connect } from "react-redux";
import { comdex } from "../../config/network";
import {message} from 'antd'

const Position = ({ lang, pool, markets, setPoolBalances }) => {
  const [poolBalance, setLocalPoolBalance] = useState([]);
  const [poolTokenSupply, setPoolTokenSupply] = useState();

  useEffect(() => {
    fetchBalance(pool);
    fetchSupply(pool);
  }, [pool]);

  const fetchSupply = () => {
    querySupply(pool?.denom, (error, supply) => {
      if (error) {
        message.error(error);
        return;
      }

      setPoolTokenSupply(supply?.amount);
    });
  };

  const fetchBalance = (pool) => {
    queryAllBalances(
      pool?.reserveAccountAddress,
      (error, result) => {
        if (error) {
          return;
        }

        // reversing the order if first denom not native
        setLocalPoolBalance(
          result.balances?.[0]?.denom !== comdex.coinMinimalDenom
            ? result.balances.reverse()
            : result.balances
        );
      }
    );
  };

  const calculateUserShare = (userLiquidity, denomAmount, poolTokenSupply) => {
    const userShare =
      (userLiquidity * denomAmount) / Number(poolTokenSupply?.amount);
    return userShare ? amountConversion(userShare) : 0;
  };

  const firstAssetShare = calculateUserShare(
    pool?.amount,
    poolBalance && poolBalance[0] && poolBalance[0].amount,
    poolTokenSupply
  );
  const secondAssetShare = calculateUserShare(
    pool?.amount,
    poolBalance && poolBalance[1] && poolBalance[1].amount,
    poolTokenSupply
  );

  const getUserLiquidity = () => {
    const share =
      Number(firstAssetShare) *
        marketPrice(
          markets,
          poolBalance && poolBalance[0] && poolBalance[0].denom
        ) +
      Number(secondAssetShare) *
        marketPrice(
          markets,
          poolBalance && poolBalance[1] && poolBalance[1].denom
        );

    setPoolBalances(share, pool?.id?.low);
    return share ? share.toFixed(DOLLAR_DECIMALS) : 0;
  };
  
  return (
    <>
      <p>
        {firstAssetShare} {denomConversion(poolBalance?.[0]?.denom)} +{" "}
        {secondAssetShare} {denomConversion(poolBalance?.[1]?.denom)}{" "}
      </p>
      <small>
        {getUserLiquidity()} {variables[lang].USD}
      </small>
    </> 
  );
};

Position.propTypes = {
  setPoolBalances: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
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

const actionsToProps = {
  setPoolBalances,
};

export default connect(null, actionsToProps)(Position);
