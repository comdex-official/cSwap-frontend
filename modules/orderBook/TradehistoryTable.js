import React, { useCallback, useState, useEffect } from "react";
import styles from "./OrderBook.module.scss";
import { Table, message } from "antd";
import Date from "../portfolio/Date";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import { generateHash, truncateString } from "../../utils/string";
import { abbreviateMessage, fetchTxHistory } from "../../services/transaction";
import { setTransactionHistory } from "../../actions/account";
import { connect } from "react-redux";
import { comdex } from "../../config/network";
import Copy from "../../shared/components/Copy";

const columns = [
  {
    title: "Message Type",
    dataIndex: "msgType",
    key: "msgType",
    width: 300,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: 300,
    render: (height) => <Date height={height} />,
  },
  // {
  //   title: "Height",
  //   dataIndex: "height",
  //   key: "height",
  //   width: 300,
  // },
  {
    title: "Transaction Hash",
    dataIndex: "transactionHash",
    key: "txHash",
    width: 300,
    align: "right",
  },
];

const TradehistoryTable = ({ address, setTransactionHistory, history }) => {
  const theme = "dark";

  const [inProgress, setInProgress] = useState(false);
  const [pageNumber, setpageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getTransactions = useCallback(
    (address, pageNumber, pageSize) => {
      setInProgress(true);
      fetchTxHistory(address, pageNumber, pageSize, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }

        setTransactionHistory(result.txs, result.totalCount);
      });
    },
    [setTransactionHistory]
  );

  useEffect(() => {
    getTransactions(address, pageNumber, pageSize);
  }, [address, getTransactions, pageNumber, pageSize]);

  const tableData =
    history?.list?.length &&
    history?.list?.map((item, index) => {
      const decodedTransaction = decodeTxRaw(item.tx);
      const hash = generateHash(item.tx);

      return {
        key: index,
        transactionHash: (
          <div
            className="tx-hash-col d-flex"
            style={{ columnGap: "5px", justifyContent: "flex-end" }}
          >
            <span>
              {" "}
              {
                <a
                  href={`${comdex.explorerUrlToTx.replace(
                    "{txHash}",
                    hash?.toUpperCase()
                  )}`}
                  rel="noreferrer"
                  target="_blank"
                  aria-label="explorer"
                >
                  {" "}
                  {hash && truncateString(hash, 10, 10)}
                </a>
              }{" "}
            </span>
            <Copy text={hash} />
          </div>
        ),
        msgType: abbreviateMessage(decodedTransaction.body.messages),
        date: item?.height,
        // height: item.height,
      };
    });

  const newTableData =
    tableData &&
    tableData.filter(
      (item) =>
        item?.msgType === "MarketOrder" || item?.msgType === "LimitOrder"
    );
  console.log(newTableData, "history");
  const handleChange = (value) => {
    setpageNumber(value.current);
    setPageSize(value.pageSize);
    getTransactions(address, value.current, value.pageSize);
  };

  return (
    <div
      className={`${styles.orderbook__table__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <Table
        className="custom-table assets-table"
        columns={columns}
        dataSource={newTableData}
        loading={inProgress}
        pagination={{
          total: history && history.count,
          showSizeChanger: true,
          defaultPageSize: 5,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        total={history && history.count}
        onChange={(event) => handleChange(event)}
        // locale={{ emptyText: <NoDataIcon /> }}
        scroll={{ x: "100%" }}
      />
    </div>
  );
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    history: state.account.history,
    address: state.account.address,
  };
};

const actionsToProps = {
  setTransactionHistory,
};

export default connect(stateToProps, actionsToProps)(TradehistoryTable);
