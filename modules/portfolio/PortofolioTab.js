import { Col, Row, Tabs } from "antd";
import React, { useState } from "react";
import { connect } from "react-redux";
import "./Portfolio.module.scss";
import PortfolioTable from "./PortfollioTable";
import MyPoolsTable from "./MyPools";
import HistoryTable from "./History";
import { setPools, setUserLiquidityInPools } from "../../actions/liquidity";

const Assets = () => {
  const [activeKey, setActiveKey] = useState("1");

  const assetTabItems = [
    {
      label: "Assets",
      key: "1",
      children: <PortfolioTable />,
    },
    {
      label: "Liquidity",
      key: "2",
      children: <MyPoolsTable />,
    },
    { label: "History", key: "3", children: <HistoryTable /> },
  ];

  return (
    <div className="app-content-wrapper">
      <div className="assets-section">
        <Row className="mt-4">
          <Col style={{ width: "100%" }}>
            <div className="portifolio-tabs">
              <Tabs
                className="comdex-tabs"
                onChange={setActiveKey}
                activeKey={activeKey}
                type="card"
                items={assetTabItems}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const stateToProps = (state) => {
  return {
  };
};
const actionsToProps = {
  setPools,
  setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(Assets);
