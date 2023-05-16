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

const MyPools = ({
  pools,
  lang,
  userLiquidityInPools,
  setShowMyPool,
  setSelectedManagePool,
}) => {
  const navigate = useRouter();

  const rawUserPools = Object.keys(userLiquidityInPools)?.map((poolKey) =>
    pools?.find(
      (pool) =>
        pool?.id?.toNumber() === Number(poolKey) &&
        Number(userLiquidityInPools[poolKey]) > 0
    )
  );

  const userPools = rawUserPools.filter((item) => item);

  const columns = [
    {
      title: "Asset Pair",
      dataIndex: "assetpair",
      key: "assetpair",
      align: "center",
      // width: 200,
      render: (pool) => <PoolCardRow key={pool?.id} pool={pool} lang={lang} />,
    },
    {
      title: "APR",
      dataIndex: "apr",
      key: "apr",
      align: "left",
      // width: 150,
      render: (pool) => (
        <div className="farm-apr-modal portfolio-apr">
          <ShowAPR pool={pool} />
        </div>
      ),
    },
    {
      title: <>My Liquidity</>,
      dataIndex: "position",
      key: "position",
      // width: 300,
      render: (position) => (
        <div>
          ${commaSeparator(Number(position || 0).toFixed(DOLLAR_DECIMALS))}
        </div>
      ),
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
            // locale={{ emptyText: <NoDataIcon /> }}
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
  };
};

const actionsToProps = {
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setShowMyPool,
  setSelectedManagePool,
};

export default connect(stateToProps, actionsToProps)(MyPools);
