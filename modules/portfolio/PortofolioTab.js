import { Button, Col, Input, message, Row, Switch, Table, Tabs } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import "./Portfolio.module.scss";
import PortfolioTable from "./PortfollioTable";
import MyPoolsTable from './MyPools';
import HistoryTable from './History'
import { setPools, setUserLiquidityInPools } from "../../actions/liquidity";

const Assets = ({
    lang,
    assetBalance,
    isDarkMode,
    address,
    setPools,
    balances,
    markets,
    assetMap,
    setUserLiquidityInPools,
    userLiquidityInPools,
}) => {

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

Assets.propTypes = {
    assetMap: PropTypes.object,
    setUserLiquidityInPools: PropTypes.func.isRequired,
    setPools: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    address: PropTypes.string,
    assetBalance: PropTypes.number,
    poolBalance: PropTypes.number,
    isDarkMode: PropTypes.bool.isRequired,
    balances: PropTypes.arrayOf(
        PropTypes.shape({
            denom: PropTypes.string.isRequired,
            amount: PropTypes.string,
        })
    ),
    markets: PropTypes.object,
};

const stateToProps = (state) => {
    return {
        assetMap: state.asset.map,
        userLiquidityInPools: state.liquidity.userLiquidityInPools,
        lang: state.language,
        assetBalance: state.account.balances.asset,
        poolBalance: state.account.balances.pool,
        isDarkMode: state.theme.theme.darkThemeEnabled,
        address: state.account.address,
        balances: state.account.balances.list,
        markets: state.oracle.market.list,
    };
};
const actionsToProps = {
    setPools,
    setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(Assets);