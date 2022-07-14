import React from 'react'
import './index.scss';
import { Tabs } from 'antd';
import { Table } from 'antd';
import { Col, Row } from '../../../components/common';

const Trade = () => {
    const { TabPane } = Tabs;
    const orderBookColumn = [
        {
            title: 'Price USDT',
            dataIndex: 'name',
        },
        {
            title: 'Amount ATOM',
            dataIndex: 'age',
        },
        {
            title: 'Total USDT',
            dataIndex: 'address',
        },
    ];
    const tradesColumn = [
        {
            title: 'Price USDT',
            dataIndex: 'name',
        },
        {
            title: 'Amount ATOM',
            dataIndex: 'age',
        },
        {
            title: 'Time',
            dataIndex: 'address',
        },
    ];
    const orderBook = [];
    for (let i = 0; i < 50; i++) {
        orderBook.push({
            key: i,
            name: `${i * 12 + 1}`,
            age: `${i * 7 + 14}`,
            address: `${i * 14 + 3}`,
        });
    }
    const trades = [];
    for (let i = 0; i < 50; i++) {
        trades.push({
            key: i,
            name: `${i * 12 + 1}`,
            age: `${i * 7 + 14}`,
            address: `${i + 3}:${i + 20}:${i + 1}`,
        });
    }

    function callback(key) {
        console.log(key);
    }
    return (
        <>
            <div className="app-content-wrapper swap_trade_table mt-15px ">
                <Row>
                    <Col>
                        <div className="order_tabs_main_container">
                            <div className="order_tabs_container">
                                <Tabs defaultActiveKey="1" onChange={callback} className='comdex-tabs'>
                                    <TabPane tab="Orderbook" key="1" >
                                        <Table columns={orderBookColumn} dataSource={orderBook} pagination={false}
                                            scroll={{ y: 205 }}
                                            className='custom-table ' />
                                        <div className="price_indicator_container">
                                            <div className="price">18.685</div>
                                        </div>
                                        <Table showHeader={false} columns={orderBookColumn} dataSource={orderBook} pagination={false} scroll={{ y: 246 }} className='custom-table ' />
                                    </TabPane>
                                    <TabPane tab="Trades" key="2">
                                        <Table columns={tradesColumn} dataSource={trades} pagination={false} scroll={{ y: 400 }} className='custom-table ' />
                                    </TabPane>
                                </Tabs>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default Trade;