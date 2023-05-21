import React from "react";
import styles from "./OrderBook.module.scss";
import { Table } from "antd";

const TradehistoryTable = () => {
  const theme = "dark";

  const columns = [
    {
      title: "Pair",
      dataIndex: "Pair",
      key: "Pair",
    },
    {
      title: "Type",
      dataIndex: "Type",
      key: "Type",
      align: "left",
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      key: "Amount",
      align: "left",
    },
    {
      title: "Price",
      dataIndex: "Price",
      key: "Price",
      align: "left",
    },
    {
      title: "Time",
      dataIndex: "Time",
      key: "Time",
      align: "left",
    },
    {
      title: "Action",
      dataIndex: "Action",
      key: "Action",
    },
  ];

  return (
    <div
      className={`${styles.orderbook__table__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <Table
        className="custom-table assets-table"
        dataSource={[]}
        columns={columns}
        pagination={false}
        scroll={{ x: "100%" }}
      />
    </div>
  );
};

export default TradehistoryTable;
