import { message, Skeleton } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setPoolRewards } from "../../actions/liquidity";
import SvgIcon from '../../components/common/svg-icon/svg-icon';
import { DOLLAR_DECIMALS } from "../../constants/common";
import { fetchRestAPRs } from "../../services/liquidity/query";
import { commaSeparator } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import { Button, Modal } from 'antd';

const ShowAPR = ({ pool, rewardsMap, setPoolRewards }) => {
  const [isFetchingAPR, setIsFetchingAPR] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
          {Object.keys(list).map((key, index) => (
            <>
              {index < 2 ?
                <span className="ml-1">
                  {<SvgIcon name={iconNameFromDenom(list[key]?.denom)} />}
                  {commaSeparator((Number(list[key]?.apr) || 0).toFixed())}
                  %
                </span>
                :
                ""}
            </>
          ))}
          <Button type="primary" onClick={showModal} className="view-all-farm-apr">
            View All &rarr;
          </Button>
          <Modal title="Pool APRs" className="farm-apr-modal" visible={isModalOpen} onOk={handleOk} onCancel={handleCancel} centered={true} footer={false}>
            {Object.keys(list).map((key) => (
              <>
                <span className="ml-1">
                  {<SvgIcon name={iconNameFromDenom(list[key]?.denom)} />}
                  {commaSeparator((Number(list[key]?.apr) || 0).toFixed())}
                  %
                </span>
              </>
            ))}
          </Modal>

        </>
      )
    }
    else {
      return Object.keys(list).map((key) => (
        <>
          <span className="ml-1">
            {<SvgIcon name={iconNameFromDenom(list[key]?.denom)} />}
            {commaSeparator((Number(list[key]?.apr) || 0).toFixed())}
            %
          </span>

        </>
      ));
    }
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
        showIndividualAPR(rewardsMap?.[pool?.id?.low]?.incentive_rewards)
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
