import { Button, Col, Row, Table, Tooltip } from "antd";
import * as PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import {
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setShowMyPool,
  setSelectedManagePool,
} from "../../actions/liquidity";
// import NoDataIcon from "../../components/common/NoDataIcon";
import TooltipIcon from "../../shared/components/TooltipIcon";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { commaSeparator } from "../../utils/number";
import ShowAPR from "./ShowAPR";
import PoolCardRow from "./MyPoolRow";
import { useRouter } from "next/router";
import NoDataIcon from "../../shared/components/NoDataIcon";
import { denomConversion, fixedDecimal } from "../../utils/coin";

const MyPools = ({
  pools,
  lang,
  userLiquidityInPools,
  setShowMyPool,
  setSelectedManagePool,
  rewardsMap,
}) => {
  const navigate = useRouter();

  const rawUserPools = Object.keys(userLiquidityInPools)?.map((poolKey) =>
    pools?.find(
      (pool) =>
        pool?.id?.toNumber() === Number(poolKey) &&
        Number(userLiquidityInPools[poolKey]) > 0
    )
  );

  const getMasterPool = (_id) => {
    const hasMasterPool = rewardsMap?.[_id]?.incentive_rewards?.some(
      (pool) => pool.master_pool
    );
    return hasMasterPool;
  };

  const calculateMasterPoolApr = (_id) => {
    const totalMasterPoolApr = rewardsMap?.[
      _id
    ]?.incentive_rewards.filter((reward) => reward.master_pool);
    // .reduce((acc, reward) => acc + reward.apr, 0);

    return fixedDecimal(totalMasterPoolApr?.[0]?.apr);
  };

  const calculateChildPoolApr = (_id) => {
    const totalApr = rewardsMap?.[_id]?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = rewardsMap?.[
      _id
    ]?.swap_fee_rewards.reduce((acc, reward) => acc + reward.apr, 0);
    const total = totalApr + swapFeeApr;
    return fixedDecimal(total);
  };

  const calculateApr = (_id) => {
    getMasterPool(_id);
    if (getMasterPool(_id)) {
      return calculateMasterPoolApr(_id);
    } else {
      return calculateChildPoolApr(_id);
    }
  };

  const userPools = rawUserPools.filter((item) => item);

  const columns = [
    {
      title: "Asset Pair",
      dataIndex: "assetpair",
      key: "assetpair",
      align: "center",
      width: 400,
      render: (pool) => <PoolCardRow key={pool?.id} pool={pool} lang={lang} />,
      sorter: (a, b) =>
        denomConversion(a?.assetpair?.balances?.baseCoin?.denom)?.localeCompare(
          denomConversion(b?.assetpair?.balances?.quoteCoin?.denom)?.symbol
        ),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
    },
    {
      title: "APR",
      dataIndex: "apr",
      key: "apr",
      align: "left",
      width: 250,
      render: (pool) => (
        <div className="farm-apr-modal portfolio-apr">
          <ShowAPR pool={pool} />
        </div>
      ),
      sorter: (a, b) =>
        Number(calculateApr(a?.apr?.id?.toNumber()) || 0) -
        Number(calculateApr(b?.apr?.id?.toNumber()) || 0),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
    },
    {
      title: <>My Liquidity</>,
      dataIndex: "position",
      key: "position",
      width: 200,
      render: (position) => (
        <div>
          ${commaSeparator(Number(position || 0).toFixed(DOLLAR_DECIMALS))}
        </div>
      ),
      sorter: (a, b) => Number(a?.position || 0) - Number(b?.position || 0),
      sortDirections: ["ascend", "descend"],
      showSorterTooltip: false,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "right",
      width: 100,
      render: (item) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedManagePool(item);
            setShowMyPool(true);
            navigate.push(`/farm`);
          }}
          className="btn-filled"
          size="small"
        >
          Manage
        </Button>
      ),
    },
  ];

  const tableData =
    userPools.length > 0 &&
    userPools.map((item, index) => {
      return {
        key: index,
        assetpair: item,
        position: userLiquidityInPools[item?.id],
        reward: item?.reward,
        apr: item,
        action: item,
      };
    });

  const handleClick = () => {
    navigate.push(`/farm`);
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col style={{ width: "100%" }}>
          <Table
            className="custom-table farm-table"
            dataSource={tableData}
            columns={columns}
            pagination={false}
            scroll={{ x: "100%" }}
            locale={{
              emptyText: (
                <NoDataIcon
                  text="No Liquidity Provided"
                  button={true}
                  buttonText={"Go To Pools"}
                  OnClick={() => handleClick()}
                />
              ),
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

MyPools.propTypes = {
  lang: PropTypes.string.isRequired,
  setFirstReserveCoinDenom: PropTypes.func.isRequired,
  setSecondReserveCoinDenom: PropTypes.func.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
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
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    balances: state.account.balances.list,
    pools: state.liquidity.pool.list,
    markets: state.oracle.market.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    rewardsMap: state.liquidity.rewardsMap,
  };
};

const actionsToProps = {
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setShowMyPool,
  setSelectedManagePool,
};

export default connect(stateToProps, actionsToProps)(MyPools);
