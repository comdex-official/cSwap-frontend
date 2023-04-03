import { Button, Select, Table, Tabs } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { SvgIcon } from "../../components/common";
import { APP_ID, DOLLAR_DECIMALS } from "../../constants/common";
import {
  fetchExchangeRateValue,
  fetchRestPairs
} from "../../services/liquidity/query";
import {
  commaSeparator,
  formateNumberDecimalsAuto,
  formatNumber,
  marketPrice
} from "../../utils/number";
import Buy from "./Buy";
import "./index.scss";
import Sell from "./Sell";

let tvScriptLoadingPromise;

const OrderBook = ({ markets, balances }) => {
  const [pairs, setPairs] = useState();
  const [selectedPair, setSelectedPair] = useState();

  useEffect(() => {
    fetchRestPairs((error, pairs) => {
      if (error) {
        return;
      }

      setPairs(pairs?.data);
    });
  },[]);

  useEffect(() => {
    console.log("this is selected", selectedPair);
    if (selectedPair?.pair_id) {
      fetchExchangeRateValue(APP_ID, selectedPair?.pair_id, (error, result) => {
        if (error) {
          console.log("the error is", error);
          return;
        }

        console.log("result", result);
      });
    }
  }, [selectedPair]);

  useEffect(() => {
    if (pairs?.length) {
      setSelectedPair(pairs[0]);
    }
  }, [pairs]);

  const dataSource = [
    {
      key: "1",
      price: "$100.00",
      agamount: "$855.00",
    },
    {
      key: "2",
      price: "$200.00",
      agamount: "$2,500.00",
    },
    {
      key: "3",
      price: "$55.00",
      agamount: "$680.00",
    },
    {
      key: "4",
      price: "$75.00",
      agamount: "$349.00",
    },
    {
      key: "52",
      price: "$5.00",
      agamount: "$96.00",
    },
  ];

  const columns = [
    {
      title: "Price (CMST)",
      dataIndex: "price",
      key: "price",
      className: "text-red",
    },
    {
      title: "AgAmount (CMDX)",
      dataIndex: "agamount",
      key: "agamount",
      align: "right",
    },
  ];

  const dataSource2 = [
    {
      key: "1",
      price: "$100.00",
      agamount: "$855.00",
    },
    {
      key: "2",
      price: "$200.00",
      agamount: "$2,500.00",
    },
    {
      key: "3",
      price: "$55.00",
      agamount: "$680.00",
    },
    {
      key: "4",
      price: "$75.00",
      agamount: "$349.00",
    },
    {
      key: "52",
      price: "$5.00",
      agamount: "$96.00",
    },
  ];

  const columns2 = [
    {
      title: "Price (CMST)",
      dataIndex: "price",
      key: "price",
      className: "text-green",
    },
    {
      title: "AgAmount (CMDX)",
      dataIndex: "agamount",
      key: "agamount",
      align: "right",
    },
  ];

  const recentTradesdataSource = [
    {
      key: "1",
      price: "$100.00",
      agamount: "$855.00",
      time: "18:49:44",
    },
    {
      key: "2",
      price: "$200.00",
      agamount: "$2,500.00",
      time: "18:44:34",
    },
    {
      key: "3",
      price: "$55.00",
      agamount: "$680.00",
      time: "18:44:34",
    },
    {
      key: "4",
      price: "$75.00",
      agamount: "$349.00",
      time: "18:44:34",
    },
    {
      key: "5",
      price: "$5.00",
      agamount: "$96.00",
      time: "18:44:34",
    },
    {
      key: "6",
      price: "$200.00",
      agamount: "$2,500.00",
      time: "18:44:34",
    },
    {
      key: "7",
      price: "$55.00",
      agamount: "$680.00",
      time: "18:44:34",
    },
    {
      key: "8",
      price: "$75.00",
      agamount: "$349.00",
      time: "18:44:34",
    },
    {
      key: "9",
      price: "$5.00",
      agamount: "$96.00",
      time: "18:44:34",
    },
    {
      key: "10",
      price: "$5.00",
      agamount: "$96.00",
      time: "18:44:34",
    },
    {
      key: "11",
      price: "$200.00",
      agamount: "$2,500.00",
      time: "18:44:34",
    },
    {
      key: "12",
      price: "$55.00",
      agamount: "$680.00",
      time: "18:44:34",
    },
    {
      key: "13",
      price: "$75.00",
      agamount: "$349.00",
      time: "18:44:34",
    },
    {
      key: "14",
      price: "$5.00",
      agamount: "$96.00",
      time: "18:44:34",
    },
    {
      key: "15",
      price: "$5.00",
      agamount: "$96.00",
      time: "18:44:34",
    },
  ];

  const recentTradescolumns = [
    {
      title: "Price (CMST)",
      dataIndex: "price",
      key: "price",
      className: "text-green",
    },
    {
      title: "Amount (CMDX)",
      dataIndex: "agamount",
      key: "agamount",
      align: "right",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      align: "right",
    },
  ];

  const ordersTablecolumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Remaining Time",
      dataIndex: "remaining_time",
      key: "remaining_time",
    },
    {
      title: "Pair",
      dataIndex: "pair",
      key: "pair",
    },
    {
      title: "Direction",
      dataIndex: "direction",
      key: "direction",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Filled",
      dataIndex: "filled",
      key: "filled",
    },
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
    },
    {
      title: <Button className="cancel-all-btn">Cancel All</Button>,
      dataIndex: "cancel_all",
      key: "cancel_all",
      align: "right",
      render: () => (
        <Button type="primary" size="small">
          Cancel
        </Button>
      ),
    },
  ];

  const orderTabledataSource = [
    {
      key: "1",
      date: "06/01/2023",
      remaining_time: "11:12:13",
      pair: "2",
      direction: "LF",
      price: "$120",
      filled: "Yes",
      order_id: "$855.00",
    },
    {
      key: "2",
      date: "06/01/2023",
      remaining_time: "11:12:13",
      pair: "2",
      direction: "LF",
      price: "$120",
      filled: "Yes",
      order_id: "$855.00",
    },
  ];

  const tabItems = [
    {
      label: "Buy",
      key: "1",
      children: <Buy pair={selectedPair} balances={balances} markets={markets} />,
    },
    {
      label: "Sell",
      key: "2",
      children: <Sell pair={selectedPair} balances={balances} markets={markets}/>,
    },
  ];

  const tabItemsBottom = [
    {
      label: "Open Order (0)",
      key: "1",
    },
    {
      label: "Open Order (0)",
      key: "2",
    },
    {
      label: "Trade History",
      key: "3",
    },
    {
      label: "Funds",
      key: "4",
    },
  ];

  const onLoadScriptRef = useRef();
  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => (onLoadScriptRef.current = null);

    function createWidget() {
      if (
        document.getElementById("tradingview_6964b") &&
        "TradingView" in window
      ) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "NASDAQ:AAPL",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_6964b",
        });
      }
    }
  }, []);

  const handlePairChange = (value) => {
    setSelectedPair(pairs?.find((item) => item?.pair_id === value));
  };

  console.log("selected pair", selectedPair);

  return (
    <div className="app-content-wrapper">
      <div className="orderbook-wrapper">
        <div className="orderbook-col1">
          <div className="chart-card">
            <div className="card-header">
              <Select
                onChange={handlePairChange}
                value={selectedPair?.pair_id || null}
                options={pairs?.map((item) => {
                  return {
                    value: item?.pair_id,
                    label: item?.pair_symbol,
                  };
                })}
              />
              <ul>
                <li>
                  <label>+1.319%</label>
                  <p>=190345</p>
                </li>
                <li>
                  <label>24h Volume</label>
                  <p>
                    {commaSeparator(
                      formatNumber(
                        Number(selectedPair?.total_volume_24h || 0).toFixed(
                          DOLLAR_DECIMALS
                        )
                      )
                    )}
                  </p>
                </li>
                <li>
                  <label>24h High Price</label>
                  <p>
                    {commaSeparator(
                      formateNumberDecimalsAuto({
                        price: selectedPair?.base_coin_price || 0,
                      })
                    )}
                  </p>
                </li>
                <li>
                  <label>24h Low Price</label>
                  <p>
                    {commaSeparator(
                      formateNumberDecimalsAuto({
                        price: selectedPair?.base_coin_price || 0,
                      })
                    )}
                  </p>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tradingview-widget-container">
                <div id="tradingview_6964b" />
              </div>
            </div>
          </div>

          <div className="bottom-area">
            <Tabs className="comdex-tabs" type="card" items={tabItemsBottom} />
            <div>
              <Table
                scroll={{ x: "100%" }}
                className="order-tables"
                dataSource={orderTabledataSource}
                columns={ordersTablecolumns}
                pagination={false}
              />
            </div>
          </div>
        </div>
        <div className="orderbook-col2">
          <div className="order-card">
            <div className="card-header">
              <h4>Order Book</h4>
              <div className="right-action">
                0.001 <SvgIcon name="arrow-down" viewbox="0 0 19.244 10.483" />
              </div>
            </div>
            <div className="card-body">
              <Table
                className="order-tables"
                dataSource={dataSource}
                columns={columns}
                pagination={false}
              />
            </div>
            <div className="header-bottom">
              {commaSeparator(
                formateNumberDecimalsAuto({
                  price: selectedPair?.base_coin_price || 0,
                })
              )}{" "}
              <span>
                $
                {formateNumberDecimalsAuto({
                  price:
                    Number(
                      commaSeparator(
                        formateNumberDecimalsAuto({
                          price: selectedPair?.base_coin_price || 0,
                        })
                      )
                    ) * marketPrice(markets, selectedPair?.base_coin_denom),
                })}
              </span>
            </div>
            <div className="card-body-bottom">
              <Table
                className="order-tables"
                dataSource={dataSource2}
                columns={columns2}
                pagination={false}
                showHeader={false}
              />
            </div>
          </div>
          <div className="order-card mt-4">
            <div className="card-header">
              <h4>Recent Trades</h4>
            </div>
            <div className="card-body">
              <Table
                className="order-tables"
                dataSource={recentTradesdataSource}
                columns={recentTradescolumns}
                pagination={false}
              />
            </div>
          </div>
        </div>
        <div className="orderbook-col3">
          <div className="spot-card">
            <div className="card-header">
              Spot
              <div>
                <SvgIcon name="filter2" viewbox="0 0 16.626 12.5" />
              </div>
            </div>
            <div className="card-body">
              <Tabs className="comdex-tabs" type="card" items={tabItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderBook.propTypes = {
  markets: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
};

const stateToProps = (state) => {
  return {
    markets: state.oracle.market.list,
    balances: state.account.balances.list,
  };
};

export default connect(stateToProps)(OrderBook);
