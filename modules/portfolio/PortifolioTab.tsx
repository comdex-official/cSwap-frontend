import { Button, Col, Input, message, Row, Switch, Table, Tabs } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { IoReload } from "react-icons/io5";
import { connect, useDispatch } from "react-redux";
import { setAccountBalances } from "../../logic/redux/account/account";
import { setLPPrices, setMarkets } from "../../logic/redux/oracle";
import "./Portfolio.module.scss";
import styles from './Portfolio.module.scss';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import dynamic from 'next/dynamic';
import { useRouter } from "next/router";
// import MyPools from './MyPools'
// import History from './History.tsx'

const Assets = () => {
    const [active, setActive] = useState('Assets');

    const PortfolioTable = dynamic(
        () => import('@/modules/portfolio/PortfollioTable')
    );
    const MyPoolsTable = dynamic(
        () => import('@/modules/portfolio/MyPools')
    );
    const HistoryTable = dynamic(
        () => import('@/modules/portfolio/History')
    );

    const location = useRouter();


    const Search = dynamic(() => import('@/shared/components/search/Search'));
    const theme = useAppSelector((state) => state.theme.theme);

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
                        <div className="myhome-bottom">
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

// Assets.propTypes = {
//     lang: PropTypes.string.isRequired,
//     setAccountBalances: PropTypes.func.isRequired,
//     setMarkets: PropTypes.func.isRequired,
//     setLPPrices: PropTypes.func.isRequired,
//     assetBalance: PropTypes.number,
//     assetMap: PropTypes.object,
//     assetDenomMap: PropTypes.object,
//     balances: PropTypes.arrayOf(
//         PropTypes.shape({
//             denom: PropTypes.string.isRequired,
//             amount: PropTypes.string,
//         })
//     ),
//     markets: PropTypes.object,
//     lpPrices: PropTypes.object,
//     refreshBalance: PropTypes.number.isRequired,
// };

// const stateToProps = (state: any) => {
//     return {
//         lang: state.language,
//         assetBalance: state.account.assetBalance,
//         balances: state.account.account.balances.list,
//         markets: state.account.oracle.market.list,
//         lpPrices: state.account.oracle.lpPrice.list,
//         refreshBalance: state.account.account.refreshBalance,
//         assetMap: state.account.asset.map,
//         assetDenomMap: state.account.asset.appAssetMap,
//     };
// };

// const actionsToProps = {
//     setAccountBalances,
//     setMarkets,
//     setLPPrices,
// };

// export default connect(stateToProps, actionsToProps)(Assets);
export default Assets;
