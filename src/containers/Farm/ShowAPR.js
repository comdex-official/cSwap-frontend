import { message, Skeleton } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setPoolRewards } from "../../actions/liquidity";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { fetchRestAPRs } from "../../services/liquidity/query";
import { commaSeparator } from "../../utils/number";

const ShowAPR = ({ pool, rewardsMap, setPoolRewards }) => {
  const [isFetchingAPR, setIsFetchingAPR] = useState(false);

  useEffect(() => {
    getAPRs();
  }, [pool]);

  const getAPRs = () => {
    setIsFetchingAPR(true);
    fetchRestAPRs((error, result) => {
      setIsFetchingAPR(false);
      if (error) {
        message.error(error);
        return;
      }

      setPoolRewards(result?.data);
    });
  };

  return (
    <>
      {isFetchingAPR && !rewardsMap?.[pool?.id?.low] ? (
        <Skeleton.Button
          className="apr-skeleton"
          active={true}
          size={"small"}
        />
      ) : Number(rewardsMap?.[pool?.id?.low]?.incentive_rewards[0]?.apr) ? (
        `${commaSeparator(
          Number(
            rewardsMap?.[pool?.id?.low]?.incentive_rewards[0]?.apr
          ).toFixed(DOLLAR_DECIMALS)
        )}%`
      ) : (
        `${commaSeparator(Number(0).toFixed(DOLLAR_DECIMALS))}%`
      )}
    </>
  );
};

ShowAPR.propTypes = {
  setPoolRewards: PropTypes.func.isRequired,
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
  rewardsMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    rewardsMap: state.liquidity.rewardsMap,
  };
};

const actionsToProps = {
  setPoolRewards,
};

export default connect(stateToProps, actionsToProps)(ShowAPR);
