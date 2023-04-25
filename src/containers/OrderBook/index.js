import { Button, message, Select, Table, Tabs } from "antd";
import Long from "long";
import moment from "moment";
import * as PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { widget } from '../../charting_library';
import { SvgIcon } from "../../components/common";
import NoDataIcon from "../../components/common/NoDataIcon";
import Snack from "../../components/common/Snack";
import { APP_ID, DOLLAR_DECIMALS } from "../../constants/common";
import { signAndBroadcastTransaction } from "../../services/helper";
import {
  fetchExchangeRateValue,
  fetchRestPairs,
  queryOrders,
  queryUserOrders
} from "../../services/liquidity/query";
import { defaultFee } from "../../services/transaction";
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
import { errorMessageMappingParser, orderStatusText } from "../../utils/string";
import variables from "../../utils/variables";
import Buy from "./Buy";
import Datafeed from "./datafeed.js";
import "./index.scss";
import Sell from "./Sell";
import TradingViewChart from "./TradingViewChart";

let tvScriptLoadingPromise;

const OrderBook = ({ markets, balances, assetMap, address, lang }) => {
  const [pairs, setPairs] = useState();
  const [selectedPair, setSelectedPair] = useState();
  const [myOrders, setMyOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState();
  const [cancelInProgress, setCancelInProgress] = useState(false);

  useEffect(() => {
    fetchRestPairs((error, pairs) => {
      if (error) {
        return;
      }

      setPairs(pairs?.data);
    });
  }, []);

  useEffect(() => {
    if (selectedPair?.pair_id) {
      fetchExchangeRateValue(APP_ID, selectedPair?.pair_id, (error, result) => {
        if (error) {
          return;
        }
      });
    }
  }, [selectedPair]);

  useEffect(() => {
    if (pairs?.length) {
      setSelectedPair(pairs[0]);
    }
  }, [pairs]);

  useEffect(() => {
    fetchUserOrders(address, selectedPair?.pair_id);
    let intervalId = setInterval(
      () => fetchUserOrders(address, selectedPair?.pair_id),
      10000
    );

    return () => clearInterval(intervalId);
  }, [address, selectedPair?.pair_id]);

  useEffect(() => {
    fetchOrders(selectedPair);
    let intervalId = setInterval(() => fetchOrders(selectedPair), 10000);

    return () => clearInterval(intervalId);
  }, [selectedPair]);

  const fetchUserOrders = async (address, pairId) => {
    if (address && pairId) {
      queryUserOrders(Long.fromNumber(pairId), address, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setMyOrders(result?.orders);
      });
    }
  };

  const fetchOrders = async (pair) => {
    if (pair?.pair_id) {
      queryOrders(Long.fromNumber(pair?.pair_id), (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setOrders(result?.orders);
      });
    }
  };

  const columns = [
    {
      title: `Price (${denomConversion(selectedPair?.quote_coin_denom)})`,
      dataIndex: "price",
      key: "price",
      className: "text-red",
    },
    {
      title: `Amount (${denomConversion(selectedPair?.base_coin_denom)})`,
      dataIndex: "amount",
      key: "amount",
      align: "right",
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
      title: `Amount (${denomConversion(selectedPair?.base_coin_denom)})`,
      dataIndex: "amount",
      key: "amount",
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

  function getParameterByName(name) {
    name = "";
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec("");
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview_6964b";
        script.src = "/public/charting_library/charting_library.standalone.js";
        script.type = "text/jsx";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => (onLoadScriptRef.current = null);

    function createWidget() {
      var datafeedUrl = "https://demo-feed-data.tradingview.com";
				var customDataUrl = getParameterByName('dataUrl');
				if (customDataUrl !== "") {
					datafeedUrl = customDataUrl.startsWith('https://') ? customDataUrl : `https://${customDataUrl}`;
				}

      const timezone = window.Intl
        ? window.Intl.DateTimeFormat().resolvedOptions().timeZone
        : "Etc/UTC";

      if (
        document.getElementById("tradingview_6964b") &&
        "TradingView" in window
      ) {
        window.tvWidget = new widget({
          symbol: 'Bitfinex:BTC/USD', // default symbol
          interval: '1D', // default interval
          fullscreen: true, // displays the chart in the fullscreen mode
          container: 'tradingview_6964b',
          datafeed: Datafeed,
          library_path: 'src/charting_library/',
        });

      //   new window.TradingView.widget({
      //     autosize: true,
      //     symbol: "NASDAQ:AAPL",
      //     // interval: "D",
      //     timezone: timezone,

      //     theme: "dark",
      //     show_popup_button: true,
      //     popup_width: "1000",
      //     popup_height: "650",
      //     style: "1",
      //     locale: "en",
      //     toolbar_bg: "#f1f3f6",
      //     enable_publishing: false,
      //     allow_symbol_change: true,
      //     container: "tradingview_6964b",
      //     // symbol: 'Bitfinex:BTC/USD', // default symbol
      //     interval: "1D", // default interval
      //     fullscreen: true, // displays the chart in the fullscreen mode
      //     datafeed: Datafeed,
      //     library_path: "src/charting_library/",
      //     loading_screen: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      //     disabled_features: [
      //       "volume_force_overlay",
      //       "header_compare",
      //       "header_interval_dialog_button",
      //       "show_interval_dialog_on_key_press",
      //       "header_symbol_search",
      //       "header_saveload",
      //     ],
      //     enabled_features: [
      //       'move_logo_to_main_pane',
      //       'hide_last_na_study_output',
      //       'clear_bars_on_series_error',
      //       'dont_show_boolean_study_arguments',
      //       'narrow_chart_enabled',
      //       'side_toolbar_in_fullscreen_mode',
      //       'save_chart_properties_to_local_storage',
      //       'use_localstorage_for_settings'
      //     ],
      //     favorites: {
      //       intervals: ['5', '15', '60', 'D'],
      //     }
      //   });
      }
    }
  }, []);

  const handlePairChange = (value) => {
    setSelectedPair(pairs?.find((item) => item?.pair_id === value));
  };

  const handleCancel = (order) => {
    setOrder(order);
    setCancelInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.liquidity.v1beta1.MsgCancelOrder",
          value: {
            orderer: address.toString(),
            appId: Long.fromNumber(APP_ID),
            pairId: order?.pairId,
            orderId: order?.id,
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setCancelInProgress(false);

        if (error) {
          message.error(error);
          return;
        }
        if (result?.code) {
          message.info(errorMessageMappingParser(result?.rawLog));
          return;
        }

        fetchOrders(selectedPair);
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

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
      title: "Amount",
      dataIndex: "trade_amount",
      key: "trade_amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      dataIndex: "cancel",
      key: "cancel",
      align: "right",
      render: (item) => (
        <Button
          type="primary"
          loading={order?.id === item?.id && cancelInProgress}
          onClick={() => handleCancel(item)}
          className="btn-filled"
          size="small"
        >
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
        cancel: item,
      };
    });

  let buyOrders = orders?.filter((item) => item.direction === 1);
  buyOrders = buyOrders.sort((a, b) => {
    return b.price - a.price; // sort descending.
  });

  let sellOrders = orders?.filter((item) => item.direction === 2);
  sellOrders = sellOrders.sort((a, b) => {
    return b.price - a.price; // sort descending.
  });

  const dataSource =
    sellOrders.length &&
    sellOrders.map((item, index) => {
      return {
        key: item?.id,
        amount: item?.amount ? amountConversion(item?.amount) : 0,
        price: item?.price ? orderPriceReverseConversion(item.price) : 0,
      };
    });

  const dataSource2 =
    buyOrders.length &&
    buyOrders.map((item, index) => {
      return {
        key: item?.id,
        amount: item?.amount ? amountConversion(item?.amount) : 0,
        price: item?.price ? orderPriceReverseConversion(item.price) : 0,
      };
    });

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
  ];

  console.log("the feed", Datafeed);

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
                  <label>
                    {commaSeparator(
                      formateNumberDecimalsAuto({
                        price: selectedPair?.price || 0,
                      })
                    )}
                  </label>
                  <p>
                    =$
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
                  </p>
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
            {/* <div className="card-body">
              <div className="tradingview-widget-container">
                <div id="tradingview_6964b" />
              </div>
            </div> */}
                      <TradingViewChart />

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
  lang: PropTypes.string,
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
    lang: state.language,
  };
};

export default connect(stateToProps)(OrderBook);
