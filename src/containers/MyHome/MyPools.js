import "./index.scss";
import * as PropTypes from "prop-types";
import { Col, Row } from "../../components/common";
import { connect } from "react-redux";
import React, { useState, useEffect } from "react";
import { Button, Table, message } from "antd";
import { queryPoolsList } from "../../services/liquidity/query";
import { setPools } from "../../actions/liquidity";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
  DOLLAR_DECIMALS,
} from "../../constants/common";
import {
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
} from "../../actions/liquidity";
import TooltipIcon from "../../components/TooltipIcon";
import PoolCardRow from "./MyPoolRow";
import { useNavigate } from "react-router";
import ShowAPR from "../Farm/ShowAPR";

const MyPools = ({ setPools, pools, lang, balances, userLiquidityInPools }) => {
  const [inProgress, setInProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPools = (offset, limit, countTotal, reverse) => {
      setInProgress(true);
      queryPoolsList(offset, limit, countTotal, reverse, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }

        setPools(result.pools);
      });
    };

    fetchPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  }, []);

  const userPools = pools.filter((pool) => {
    return balances.find((balance) => {
      return balance.denom === pool.poolCoinDenom;
    });
  });

  const columns = [
    {
      title: "Asset Pair",
      dataIndex: "assetpair",
      key: "assetpair",
      align: "center",
      render: (pool) => <PoolCardRow key={pool.id} pool={pool} lang={lang} />,
    },
    {
      title: "APR",
      dataIndex: "apr",
      key: "apr",
      align: "left",
      render: (pool) => <ShowAPR pool={pool} />,
    },
    {
      title: (
        <>
          My Liquidity
          <TooltipIcon text="Your current liquidity position in the corresponding cAsset pool" />
        </>
      ),
      dataIndex: "position",
      key: "position",
      render: (position) => (
        //TODO: take dynamic value
        <div>${Number(position || 0).toFixed(DOLLAR_DECIMALS)}</div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "right",
      render: (item) => (
        <Button
          type="primary"
          onClick={() =>
            navigate(`/farm-details/${item.id && item.id.toNumber()}`)
          }
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
        reward: item.reward,
        apr: item,
        action: item,
      };
    });

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <Table
            className="custom-table farm-table"
            loading={inProgress}
            dataSource={tableData}
            columns={columns}
            pagination={false}
            scroll={{ x: "100%" }}
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
  setPools,
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
};

export default connect(stateToProps, actionsToProps)(MyPools);
