import { Button, Col, Row, Table } from "antd";
import React from "react";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { commaSeparator } from "../../utils/number";


interface MyPoolProps {
  pools?: any
  userLiquidityInPools?: any
}


const MyPools = ({ pools, userLiquidityInPools }: MyPoolProps) => {


  const columns:any = [
    {
      title: "Asset Pair",
      dataIndex: "assetpair",
      key: "assetpair",
      align: "center",
      width: 200,
      render: (pool: any) => "123",
    },
    {
      title: "APR",
      dataIndex: "apr",
      key: "apr",
      align: "left",
      width: 150,
      render: (pool: any) => (
        <div className="farm-apr-modal portfolio-apr">
          342
        </div>
      ),
    },
    {
      title: (
        <>
          My Liquidity
        </>
      ),
      dataIndex: "position",
      key: "position",
      width: 300,
      render: (position: any) => (
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
      render: (item: any) => (
        <Button
          type="primary"
          className="btn-filled"
          size="small"
        >
          Manage
        </Button>
      ),
    },
  ];

  const tableData = [
    {
      key: 1,
      assetpair: 123,
      position: 4567,
      reward: 215,
      apr: 66,
      action: 123,
    },
    {
      key: 2,
      assetpair: 123,
      position: 4567,
      reward: 215,
      apr: 66,
      action: 123,
    },
  ]

  return (
    <div className="app-content-wrapper">
      <Row >
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



export default MyPools;
