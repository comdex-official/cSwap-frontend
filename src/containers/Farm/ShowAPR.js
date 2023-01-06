import { message, Skeleton, Tooltip } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import uuid from "react-uuid";
import { setPoolRewards } from "../../actions/liquidity";
import SvgIcon from "../../components/common/svg-icon/svg-icon";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { fetchRestAPRs } from "../../services/liquidity/query";
import { commaSeparator } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";

const ShowAPR = ({ pool, rewardsMap, setPoolRewards }) => {
  const [isFetchingAPR, setIsFetchingAPR] = useState(false);

  useEffect(() => {
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

    getAPRs();
  }, [pool, setPoolRewards]);

  const showIndividualAPR = (list) => {
    if (list?.length > 2) {
      return (
        <>
          {Object.keys(list)?.map((key, index) => (
            <div key={uuid()}>
              {index < 2 ? (
                <span className="ml-1">
                  {<SvgIcon name={iconNameFromDenom(list[key]?.denom)} />}
                  {commaSeparator(
                    (Number(list[key]?.apr) || 0).toFixed(DOLLAR_DECIMALS)
                  )}
                  % {list[key]?.master_pool ? "- Master Pool" : "- External"}
                </span>
              ) : (
                ""
              )}
            </div>
          ))}

          <span className="comdex-tooltip ">
            <Tooltip
              overlayClassName=" farm-apr-modal "
              title={Object.keys(list)?.map((key) => (
                <div key={uuid()}>
                  <span className="ml-1">
                    {<SvgIcon name={iconNameFromDenom(list[key]?.denom)} />}
                    {commaSeparator((Number(list[key]?.apr) || 0).toFixed())}%
                    {list[key]?.master_pool ? "- Master Pool" : "- External"}
                  </span>
                </div>
              ))}
            >
              <span className="view-all-farm-apr"> View All</span>
            </Tooltip>
          </span>
        </>
      );
    } else {
      return Object.keys(list)?.map((key) => (
        <>
          {list[key]?.master_pool ? (
            <Tooltip
              title={
                <>
                  Providing liquidity only in master pool makes you eligible for the external APR on Master pool.
                  To be eligible to Earn ‘Master pool’ APR and equal amount of liquidity has to be provided in any of the child pools.
                  <a href="https://docs.cswap.one/farming-rewards" target="_blank">Read more</a> about the mechanism here.
                </>
              }
              overlayClassName="comdex-tooltip"
            >
              <div key={uuid()} className="percent-box">
                <span className="ml-1">
                  {<SvgIcon name={iconNameFromDenom(list[key]?.denom)} />}
                  {commaSeparator(
                    (Number(list[key]?.apr) || 0).toFixed(DOLLAR_DECIMALS)
                  )}
                  % {list[key]?.master_pool ? "- Master Pool" : "- External"}
                </span>

              </div>
            </Tooltip>

          ) : (

            <div key={uuid()} className="percent-box">
              <span className="ml-1">
                {<SvgIcon name={iconNameFromDenom(list[key]?.denom)} />}
                {commaSeparator(
                  (Number(list[key]?.apr) || 0).toFixed(DOLLAR_DECIMALS)
                )}
                % {list[key]?.master_pool ? "- Master Pool" : "- External"}
              </span>

            </div>

          )
          }</>
      ));
    }
  };

  return (
    <>
      {isFetchingAPR && !rewardsMap?.[pool?.id?.toNumber()] ? (
        <Skeleton.Button
          className="apr-skeleton"
          active={true}
          size={"small"}
        />
      ) : Number(
          rewardsMap?.[pool?.id?.toNumber()]?.incentive_rewards[0]?.apr
        ) ? (
        showIndividualAPR(rewardsMap?.[pool?.id?.toNumber()]?.incentive_rewards)
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
