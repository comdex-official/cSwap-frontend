import { Button, message, Table, Tabs } from "antd";
import Long from "long";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { setOrders } from "../../../actions/order";
import NoDataIcon from "../../../components/common/NoDataIcon";
import Snack from "../../../components/common/Snack/index";
import { APP_ID } from "../../../constants/common";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { queryUserOrders } from "../../../services/liquidity/query";
import { defaultFee } from "../../../services/transaction";
import {
  amountConversion,
  denomConversion,
  orderPriceReverseConversion
} from "../../../utils/coin";
import { orderStatusText } from "../../../utils/string";
import variables from "../../../utils/variables";
import "./index.css";

const Order = ({ lang, assetMap }) => {
  const address = useSelector((state) => state.account.address);
  const [myOrders, setMyOrders] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [order, setOrder] = useState();

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

  const handleCancel = (order) => {
    setOrder(order);
    setInProgress(true);

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
        setInProgress(false);

        if (error) {
          message.error(error);
          return;
        }
        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        fetchOrders();
        setOrder();
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

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
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "right",
      render: (item) => (
        <Button
          type="primary"
          loading={order?.id === item?.id && inProgress}
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
        buy_sell: item?.direction === 1 ? "BUY" : "SELL",
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
        status: item?.status ? orderStatusText(item.status) : "",
        action: item,
      };
    });

  const tabItems = [
    {
      label: "Active Orders",
      key: "1",
      children: (
        <Table
          showHeader={true}
          columns={openOrderColumns}
          dataSource={openOrdersData}
          pagination={false}
          className="custom-table"
          scroll={{ x: "100%" }}
          locale={{ emptyText: <NoDataIcon /> }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="position_main_container mt-15px ">
        <div className="position_container">
          <Tabs defaultActiveKey="1" className="comdex-tabs" items={tabItems} />
        </div>
      </div>
    </>
  );
};

export default Order;
