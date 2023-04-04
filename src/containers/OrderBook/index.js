import { Button, message, Select, Table, Tabs } from "antd";
import Long from "long";
import moment from "moment";
import * as PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { setOrders } from "../../actions/order";
import { SvgIcon } from "../../components/common";
import NoDataIcon from "../../components/common/NoDataIcon";
import { APP_ID, DOLLAR_DECIMALS } from "../../constants/common";
import {
  fetchExchangeRateValue,
  fetchRestPairs,
  queryUserOrders
} from "../../services/liquidity/query";
import {
  amountConversion,
  denomConversion,
  orderPriceReverseConversion
} from "../../utils/coin";
import {
  commaSeparator,
  formateNumberDecimalsAuto,
  formatNumber,
  marketPrice
} from "../../utils/number";
import { orderStatusText } from "../../utils/string";
import Buy from "./Buy";
import "./index.scss";
import Sell from "./Sell";

let tvScriptLoadingPromise;

const OrderBook = ({ markets, balances, assetMap, address }) => {
  const [pairs, setPairs] = useState();
  const [selectedPair, setSelectedPair] = useState();
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    fetchRestPairs((error, pairs) => {
      if (error) {
        return;
      }

      setPairs(pairs?.data);
    });
  }, []);

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

  useEffect(() => {
    fetchOrders(address);
    let intervalId = setInterval(() => fetchOrders(address), 10000);

    return () => clearInterval(intervalId);
  }, [address]);

  const fetchOrders = async (address) => {
    if (address) {
      queryUserOrders(Long.fromNumber(0), address, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setOrders(result?.orders);
        setMyOrders(result?.orders);
      });
    }
  };

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
      children: (
        <Buy pair={selectedPair} balances={balances} markets={markets} />
      ),
    },
    {
      label: "Sell",
      key: "2",
      children: (
        <Sell pair={selectedPair} balances={balances} markets={markets} />
      ),
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

  const ordersTablecolumns = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
    },
    {
      title: "Expire Time",
      dataIndex: "expire_time",
      key: "expire_time",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
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

  const openOrdersData =
    myOrders.length > 0 &&
    myOrders.map((item, index) => {
      return {
        key: index,
        id: item?.id ? item?.id?.toNumber() : "",
        expire_time: item?.expireAt
          ? moment(item.expireAt).format("MMM DD, YYYY HH:mm")
          : "",
        direction: item?.direction === 1 ? "BUY" : "SELL",
        pair:
          item?.direction === 1
            ? `${denomConversion(item?.receivedCoin?.denom)}/${denomConversion(
                item?.offerCoin?.denom
              )}`
            : `${denomConversion(item?.offerCoin?.denom)}/${denomConversion(
                item?.receivedCoin?.denom
              )}`,
        offered_coin: item?.offerCoin
          ? `${amountConversion(
              item?.offerCoin?.amount,
              assetMap[item?.offerCoin?.denom]?.decimals
            )} ${denomConversion(item?.offerCoin?.denom)}`
          : "",
        trade_amount: item?.amount ? amountConversion(item?.amount) : 0,
        price: item?.price ? orderPriceReverseConversion(item.price) : 0,
        received: item?.receivedCoin
          ? `${amountConversion(
              item?.receivedCoin?.amount,
              assetMap[item?.receivedCoin?.denom]?.decimals
            )} ${denomConversion(item?.receivedCoin?.denom)}`
          : "",
        remaining: item?.remainingOfferCoin
          ? `${amountConversion(
              item?.remainingOfferCoin?.amount,
              assetMap[item?.remainingOfferCoin?.denom]?.decimals
            )} ${denomConversion(item?.remainingOfferCoin?.denom)}`
          : "",
        order_id: item?.id?.toNumber(),
        status: item?.status ? orderStatusText(item.status) : "",
        action: item,
      };
    });

  console.log("the orders", myOrders);
  const tabItemsBottom = [
    {
      label: "Open Order (0)",
      key: "1",
      children: (
        <Table
          scroll={{ x: "100%" }}
          className="order-tables"
          dataSource={openOrdersData}
          columns={ordersTablecolumns}
          pagination={false}
          locale={{ emptyText: <NoDataIcon /> }}
        />
      ),
    },
    {
      label: "Trade History",
      key: "2",
    },
    {
      label: "Funds",
      key: "3",
    },
  ];

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
                        price: selectedPair?.high || 0,
                      })
                    )}
                  </p>
                </li>
                <li>
                  <label>24h Low Price</label>
                  <p>
                    {commaSeparator(
                      formateNumberDecimalsAuto({
                        price: selectedPair?.low || 0,
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
                  price: selectedPair?.price || 0,
                })
              )}{" "}
              <span>
                $
                {formateNumberDecimalsAuto({
                  price:
                    Number(
                      commaSeparator(
                        formateNumberDecimalsAuto({
                          price: selectedPair?.price || 0,
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
  address: PropTypes.string,
  assetMap: PropTypes.object,
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
    address: state.account.address,
    markets: state.oracle.market.list,
    balances: state.account.balances.list,
    assetMap: state.asset.map,
  };
};

export default connect(stateToProps)(OrderBook);
