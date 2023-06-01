import { Icon } from "../../shared/image/Icon";
import React, { useEffect, useState } from "react";
import styles from "./OrderBook.module.scss";
import { NextImage } from "../../shared/image/NextImage";
import { ArrowRL, No_Data, Slider } from "../../shared/image";
import { OrderCustomData, OrderCustomData2 } from "./Data";
import Tab from "../../shared/components/tab/Tab";
import OrderbookTable from "../../modules/orderBook/OrderbookTable";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import {
  amountConversion,
  denomConversion,
  orderPriceReverseConversion,
} from "../../utils/coin";
import Long from "long";
import {
  fetchExchangeRateValue,
  fetchRecentTrades,
  fetchRestPairs,
  queryOrders,
  queryUserOrders,
} from "../../services/liquidity/query";
import { APP_ID, DOLLAR_DECIMALS } from "../../constants/common";
import {
  Radio,
  Select,
  Spin,
  Table,
  Tabs,
  message,
  Popover,
  Button,
} from "antd";
import {
  commaSeparator,
  formatNumber,
  formateNumberDecimalsAuto,
  marketPrice,
} from "../../utils/number";
import NoDataIcon from "../../shared/components/NoDataIcon";
import Buy from "./Buy";
import Sell from "./Sell";
import Script from "next/script";
import dynamic from "next/dynamic";
import TradehistoryTable from "./TradehistoryTable";
import Toggle from "../../shared/components/toggle/Toggle";
import moment from "moment";
import { errorMessageMappingParser, orderStatusText } from "../../utils/string";
import TooltipIcon from "../../shared/components/TooltipIcon";
import CustomInput from "../../shared/components/CustomInput/index";
import MyDropdown from "../../shared/components/dropDown/Dropdown";
import { signAndBroadcastTransaction } from "../../services/helper";
import { defaultFee } from "../../services/transaction";
import Snack from "../../shared/components/Snack/index";
import variables from "../../utils/variables";
import Loading from "../../pages/Loading";

const TVChartContainer = dynamic(
  () => import("./OrderBookTrading").then((mod) => mod),
  { ssr: false }
);

const OrderBook = ({
  markets,
  balances,
  assetMap,
  address,
  lang,
  handleToggleValue,
  toggleValue,
}) => {
  const theme = "dark";

  const TabData = ["Buy", "Sell"];

  const [active, setActive] = useState("Buy");

  const handleActive = (item) => {
    setActive(item);
  };

  const [pairs, setPairs] = useState();
  const [selectedPair, setSelectedPair] = useState();
  const [myOrders, setMyOrders] = useState([]);
  const [orderBookData, setOrderBookData] = useState([]);
  const [recentTrade, setRecentTrade] = useState([]);
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState();
  const [cancelInProgress, setCancelInProgress] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [orderLifespan, setOrderLifeSpan] = useState(21600);

  useEffect(() => {
    fetchRestPairs((error, pairs) => {
      if (error) {
        // setChartLoading(false);
        return;
      }

      setPairs(pairs?.data);
      // setChartLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedPair?.pair_id) {
      fetchExchangeRateValue(APP_ID, selectedPair?.pair_id, (error, result) => {
        if (error) {
          return;
        }

        setOrderBookData(result?.pairs[0]?.order_books);
      });
    }
  }, [selectedPair]);

  useEffect(() => {
    if (selectedPair?.pair_id) {
      fetchRecentTrades(selectedPair?.pair_id, (error, result) => {
        if (error) {
          return;
        }

        setRecentTrade(result);
      });
    }
  }, [selectedPair]);
  console.log(recentTrade);
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
        <Buy
          pair={selectedPair}
          balances={balances}
          markets={markets}
          orderLifespan={orderLifespan}
        />
      ),
    },
    {
      label: "Sell",
      key: "2",
      children: (
        <Sell
          pair={selectedPair}
          balances={balances}
          markets={markets}
          orderLifespan={orderLifespan}
        />
      ),
    },
  ];

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

  const orderItems = [
    {
      label: "Open Order",
      key: "1",
      children: (
        <OrderbookTable
          openOrdersData={openOrdersData}
          ordersTablecolumns={ordersTablecolumns}
        />
      ),
    },
    {
      label: "Trade History",
      key: "2",
      children: <TradehistoryTable />,
    },
  ];

  // const tabItemsBottom = [
  //   {
  //     label: "Open Order (0)",
  //     key: "1",
  //     children: (
  //       <Table
  //         scroll={{ x: "100%" }}
  //         className="order-tables"
  //         dataSource={openOrdersData}
  //         columns={ordersTablecolumns}
  //         pagination={false}
  //         locale={{ emptyText: <NoDataIcon /> }}
  //       />
  //     ),
  //   },
  //   {
  //     label: "Trade History",
  //     key: "2",
  //   },
  // ];

  const SettingPopup = (
    <div className="slippage-tolerance">
      <div className={"slippage-title"}>
        <div>Limit order lifespan</div>

        <TooltipIcon text="Your transaction will revert if it is pending for more than this period of time." />
      </div>
      <div className="tolerance-bottom">
        <Radio.Group
          onChange={(event) => setOrderLifeSpan(event.target.value)}
          defaultValue="a"
          value={orderLifespan}
        >
          <Radio.Button value={0}>1Block</Radio.Button>
          <Radio.Button value={21600}>6H</Radio.Button>
          <Radio.Button value={43200}>12H</Radio.Button>
          <Radio.Button value={86400}>24H</Radio.Button>
        </Radio.Group>
        <div className="input-section lifespan-setting">
          <CustomInput
            className="input-cmdx"
            onChange={(event) => handleOrderLifespanChange(event.target.value)}
            value={orderLifespan}
            validationError={false}
            placeholder="0"
          />
          <span className="percent-text">S</span>
        </div>
      </div>
    </div>
  );

  const [filterValue, setFilterValue] = useState(0);

  useEffect(
    () => setFilterValue(orderBookData[0]?.price_unit),
    [orderBookData]
  );

  const Items = [
    {
      key: "item-2",
      label: (
        <div className={styles.dropdown__orderbook}>
          <div className="filter-button-radio">
            <Radio.Group
              onChange={(event) => setFilterValue(event.target.value)}
              defaultValue="a"
              value={filterValue}
            >
              {orderBookData &&
                orderBookData.map((item) => (
                  <Radio.Button value={item?.price_unit}>
                    {Number(item?.price_unit)
                      .toFixed(7)
                      .replace(/\.?0+$/, "")}
                  </Radio.Button>
                ))}
            </Radio.Group>
          </div>
        </div>
      ),
    },
  ];

  const checkPrice = (priceUnit) => {
    const data = orderBookData.filter((item) => item?.price_unit === priceUnit);
    return data;
  };

  const BuySellData = checkPrice(filterValue);

  const matchBuySell = (baseCoin, assetCoin) => {
    if (baseCoin === assetCoin) {
      return true;
    } else {
      return false;
    }
  };

  // console.log(BuySellData, "result2");

  console.log(BuySellData[0]?.sells, "result");

  return (
    <div
      className={`${styles.orderbook__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.orderbook__wrap__head__title} ${styles.order} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <Toggle value={toggleValue} handleToggleValue={handleToggleValue} />
        <span>{"Orderbook"}</span>
      </div>
      <div
        className={`${styles.orderbook__main} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.orderbook__element__left} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__trading__view}  ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__trading__header}  ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__trading__element}  ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <NextImage src={ArrowRL} alt="" />
                <Select
                  onChange={handlePairChange}
                  value={selectedPair?.pair_id || null}
                  options={pairs?.map((item) => {
                    return {
                      key: item?.pair_id,
                      value: item?.pair_id,
                      label: item?.pair_symbol,
                    };
                  })}
                  className="orderbook__select"
                />

                {/* <NextImage src={ArrowRL} alt="" />
                <div
                  className={`${styles.orderbook__trading__title}  ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"CMDX/CMST"}
                </div>
                <Icon className={"bi bi-chevron-down"} size={"0.5rem"} /> */}
              </div>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {"Price"}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title}  ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <span>
                    {commaSeparator(
                      formateNumberDecimalsAuto({
                        price: selectedPair?.price || 0,
                      })
                    )}
                  </span>
                  <span>
                    ~$
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
              </div>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {"24h Volume"}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title}  ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {commaSeparator(
                    formatNumber(
                      Number(selectedPair?.total_volume_24h || 0).toFixed(
                        DOLLAR_DECIMALS
                      )
                    )
                  )}
                </div>
              </div>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {"24h High"}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title}  ${
                    styles.profit
                  }  ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {commaSeparator(
                    formateNumberDecimalsAuto({
                      price: selectedPair?.high || 0,
                    })
                  )}
                </div>
              </div>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {"24h Low"}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.loos
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {commaSeparator(
                    formateNumberDecimalsAuto({
                      price: selectedPair?.low || 0,
                    })
                  )}
                </div>
              </div>
            </div>
            <div
              className={`${styles.orderbook__trading__part} ${styles.loos} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {chartLoading ? (
                <div
                  className={`${styles.orderbook__trading__spin} ${
                    styles.loos
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  <Loading />
                </div>
              ) : (
                <TVChartContainer selectedPair={selectedPair} />
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.middle__row}`}>
          <div
            className={`${styles.orderbook__element__middle__upper} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__element__middle__upper__head} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__upper__head__main} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.orderbook__upper__head__left__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"Order Book"}
                </div>

                <MyDropdown
                  items={Items}
                  placement={"bottomRight"}
                  trigger={["click"]}
                  className="farm-sort"
                >
                  <div
                    className={`${
                      styles.orderbook__upper__head__right__title
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {!isNaN(
                      Number(filterValue)
                        .toFixed(7)
                        .replace(/\.?0+$/, "")
                    )
                      ? Number(filterValue)
                          .toFixed(7)
                          .replace(/\.?0+$/, "")
                      : 0}{" "}
                    <Icon className={"bi bi-chevron-down"} />
                  </div>
                </MyDropdown>
              </div>
              <div
                className={`${styles.orderbook__lower__head__main} ${
                  styles.upper
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__lower__head}  ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.orderbook__lower__head__title} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {selectedPair === undefined
                      ? `Price`
                      : `Price (${selectedPair?.quote_coin})`}
                  </div>
                  <div
                    className={`${styles.orderbook__lower__head__title} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {selectedPair === undefined
                      ? `Amount`
                      : `Amount (${selectedPair?.base_coin})`}
                  </div>
                </div>

                {BuySellData[0]?.sells.length <= 0 ||
                BuySellData[0]?.sells === undefined ? (
                  <div
                    className={`${
                      styles.orderbook__lower__table__head__title
                    } ${styles.no__data} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    {/* <NextImage
                      src={No_Data}
                      alt="Message"
                      height={50}
                      width={50}
                    /> */}
                    {"No Data"}
                  </div>
                ) : (
                  BuySellData[0]?.sells &&
                  BuySellData[0]?.sells.map((item) => (
                    <div
                      className={`${styles.orderbook__lower__head} ${
                        theme === "dark" ? styles.dark : styles.light
                      }`}
                      key={item.price}
                    >
                      <div
                        className={`${
                          styles.orderbook__lower__table__head__title
                        } ${styles.loss} ${
                          theme === "dark" ? styles.dark : styles.light
                        }`}
                      >
                        $
                        {formateNumberDecimalsAuto({
                          price:
                            Number(
                              commaSeparator(
                                formateNumberDecimalsAuto({
                                  price: item?.price || 0,
                                })
                              )
                            ) *
                            marketPrice(markets, selectedPair?.base_coin_denom),
                        })}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__lower__table__head__title
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {item?.user_order_amount
                          ? amountConversion(item?.user_order_amount)
                          : 0}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              className={`${styles.orderbook__middle__head__main} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__middle__head__main__title} ${
                  styles.active
                } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {commaSeparator(
                  formateNumberDecimalsAuto({
                    price: selectedPair?.price || 0,
                  })
                )}
              </div>
              <div
                className={`${styles.orderbook__middle__head__main__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {" "}
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
              </div>
            </div>
            <div
              className={`${styles.orderbook__lower__head__main} ${
                styles.lower
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {BuySellData[0]?.buys.length <= 0 ||
              BuySellData[0]?.buys === undefined ? (
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    styles.no__data
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {/* <NextImage
                    src={No_Data}
                    alt="Message"
                    height={50}
                    width={50}
                  /> */}
                  {"No Data"}
                </div>
              ) : (
                BuySellData[0]?.buys &&
                BuySellData[0]?.buys.map((item) => (
                  <div
                    className={`${styles.orderbook__lower__head} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                    key={item.price}
                  >
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      }  ${styles.profit} ${
                        theme === "dark" ? styles.dark : styles.light
                      }`}
                    >
                      $
                      {formateNumberDecimalsAuto({
                        price:
                          Number(
                            commaSeparator(
                              formateNumberDecimalsAuto({
                                price: item?.price || 0,
                              })
                            )
                          ) *
                          marketPrice(markets, selectedPair?.base_coin_denom),
                      })}
                    </div>
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      {item?.user_order_amount
                        ? amountConversion(item?.user_order_amount)
                        : 0}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            className={`${styles.orderbook__element__middle__lower} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__upper__head__table} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__upper__head__left__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {"Recent Trades"}
              </div>
            </div>
            <div
              className={`${styles.orderbook__middle__lower__table} ${
                recentTrade.length === 0 ? styles.no_data : ""
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.orderbook__middle__lower__table__head} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {selectedPair === undefined
                    ? `Price`
                    : `Price (${selectedPair?.quote_coin})`}
                </div>
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {selectedPair === undefined
                    ? `Amount`
                    : `Amount (${selectedPair?.base_coin})`}
                </div>
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"Time"}
                </div>
              </div>

              {recentTrade.length === 0 ? (
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    styles.no__data
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {/* <NextImage
                    src={No_Data}
                    alt="Message"
                    height={50}
                    width={50}
                  /> */}
                  {"No Recent Trades"}
                </div>
              ) : (
                recentTrade &&
                recentTrade.map((item, i) => (
                  <div
                    className={`${styles.orderbook__lower__head} ${
                      styles.lower
                    }  ${theme === "dark" ? styles.dark : styles.light}`}
                    key={i}
                  >
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      } ${
                        matchBuySell(
                          item?.pair?.base_coin?.base_denom,
                          item?.asset_in?.denom
                        )
                          ? styles.loss
                          : styles.profit
                      }  ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      $
                      {formateNumberDecimalsAuto({
                        price:
                          Number(
                            commaSeparator(
                              formateNumberDecimalsAuto({
                                price: item?.price || 0,
                              })
                            )
                          ) *
                          marketPrice(markets, selectedPair?.base_coin_denom),
                      })}
                    </div>
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      {item?.asset_in
                        ? amountConversion(item?.asset_in?.amount)
                        : 0}
                    </div>
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      {moment(item?.timestamp).format("h:mm:ss")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div
          className={`${styles.orderbook__element__right} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
          id="spot"
        >
          <div
            className={`${styles.orderbook__element__right__head} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__element__right__head__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"Spot"}
            </div>
            <Popover
              className="setting-popover"
              content={SettingPopup}
              placement="bottomRight"
              overlayClassName="cmdx-popver"
              trigger="click"
            >
              <div>
                <NextImage src={Slider} alt="Logo" />
              </div>
            </Popover>
          </div>
          <div
            className={`${styles.orderbook__element__right__body__wrap} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <Tabs className="comdex-tabs" type="card" items={tabItems} />

            {/* <Tab data={TabData} active={active} handleActive={handleActive} /> */}

            {/* <div
              className={`${styles.orderbook__element__right__body__main} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {true && (
                <div
                  className={`${styles.orderbook__element__right__body__tab} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.orderbook__body__tab__head} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.orderbook__body__tab__head__element
                      } ${styles.active} ${
                        theme === "dark" ? styles.dark : styles.light
                      }`}
                    >
                      {"Limit"}
                    </div>
                    <div
                      className={`${
                        styles.orderbook__body__tab__head__element
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      {"MARKET"}
                    </div>
                  </div>
                  <div
                    className={`${styles.orderbook__body__tab__body} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.orderbook__body__tab__body__balance
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      {"Balance: 0.0000 CMST"}
                    </div>

                    <div
                      className={`${
                        styles.orderbook__body__tab__body__input__wrap
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input__title
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"Price"}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        <input type="text" />
                      </div>
                    </div>
                    <div
                      className={`${
                        styles.orderbook__body__tab__body__input__wrap
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input__title
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"Quantity"}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        <input type="text" />
                      </div>
                    </div>
                    <div
                      className={`${styles.orderbook__body__tab__footer} ${
                        theme === "dark" ? styles.dark : styles.light
                      }`}
                    >
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"10%"}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"25%"}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"50%"}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                      >
                        {"100%"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles.orderbook__body__tab__button} ${
                      theme === "dark" ? styles.dark : styles.light
                    }`}
                  >
                    <button>{"Place Order"}</button>
                  </div>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
      {/* <div className="bottom-area">
        <Tabs className="comdex-tabs" type="card" items={tabItemsBottom} />
      </div> */}
      <div
        className={`${styles.orderbook__table__view} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <Tabs className="order-tabs" type="card" items={orderItems} />
        {/* <div
          className={`${styles.orderbook__tab__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__tab__element} ${styles.active} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Open Order (2)"}
          </div>
          <div
            className={`${styles.orderbook__tab__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Trade History"}
          </div>
        </div>
        <OrderbookTable openOrdersData={myOrders} /> */}
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
// export default OrderBook;
