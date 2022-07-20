import { message, Table, Tabs } from "antd";
import Long from "long";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { setOrders } from "../../../actions/order";
import { queryUserOrders } from "../../../services/liquidity/query";
import {
  amountConversion,
  denomConversion,
  orderPriceReverseConversion
} from "../../../utils/coin";
import { orderStatusText } from "../../../utils/string";
import "./index.css";

const Order = () => {
  const address = useSelector((state) => state.account.address);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    fetchOrders(address);
    setInterval(() => fetchOrders(address), 10000);
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

  const { TabPane } = Tabs;
  function callback(key) {
    console.log(key);
  }
  const openOrderColumns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Expire Time",
      dataIndex: "expire_time",
    },
    {
      title: "BUY/SELL",
      dataIndex: "buy_sell",
    },
    {
      title: "Offered Coin",
      dataIndex: "offered_coin",
    },
    {
      title: "Trade Amount",
      dataIndex: "trade_amount",
    },
    {
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "Received",
      dataIndex: "received",
    },
    {
      title: "Remaining",
      dataIndex: "remaining",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
  ];

  const openOrdersData =
    myOrders.length > 0 &&
    myOrders.map((item, index) => {
      return {
        key: index,
        id: item?.id ? item?.id?.low : "",
        expire_time: item?.expireAt
          ? moment(item.expireAt).format("MMM DD, YYYY HH:mm")
          : "",
        buy_sell: item?.direction === 1 ? "BUY" : "SELL",
        offered_coin: item?.offerCoin
          ? `${amountConversion(item?.offerCoin?.amount)} ${denomConversion(
              item?.offerCoin?.denom
            )}`
          : "",
        trade_amount: item?.amount ? amountConversion(item?.amount) : 0,
        price: item?.price ? orderPriceReverseConversion(item.price) : 0,
        received: item?.receivedCoin
          ? `${amountConversion(item?.receivedCoin?.amount)} ${denomConversion(
              item?.receivedCoin?.denom
            )}`
          : "",
        remaining: item?.remainingOfferCoin
          ? `${amountConversion(
              item?.remainingOfferCoin?.amount
            )} ${denomConversion(item?.remainingOfferCoin?.denom)}`
          : "",
        status: item?.status ? orderStatusText(item.status) : "",
      };
    });

  return (
    <>
      <div className="position_main_container mt-15px ">
        <div className="position_container">
          <Tabs
            defaultActiveKey="1"
            onChange={callback}
            className="comdex-tabs"
          >
            <TabPane tab="Active Orders" key="1">
              <Table
                showHeader={true}
                columns={openOrderColumns}
                dataSource={openOrdersData}
                pagination={false}
                className="custom-table "
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Order;
