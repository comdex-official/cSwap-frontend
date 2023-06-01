import React, { useCallback, useState, useEffect } from "react";
import styles from "./OrderBook.module.scss";
import { Table, message } from "antd";
import Date from "../portfolio/Date";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import { generateHash, truncateString } from "../../utils/string";
import {
  abbreviateMessage,
  fetchTradingHistory,
  fetchTxHistory,
} from "../../services/transaction";
import { setTransactionHistory } from "../../actions/account";
import { connect } from "react-redux";
import { comdex } from "../../config/network";
import Copy from "../../shared/components/Copy";
import moment from "moment";
import NoDataIcon from "../../shared/components/NoDataIcon";
import Loading from '../../pages/Loading';

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
    render: (date) => moment(date).format("MMMM Do YYYY h:mm:ss"),
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

const TradehistoryTable = ({ address }) => {
  const theme = "dark";

  const [inProgress, setInProgress] = useState(false);
  const [orderTxResponse, setOrderTxResponse] = useState([]);
  const [orderTx, setOrderTx] = useState([]);
  const [limitOrderTx, setLimitOrderTx] = useState([]);
  const [limitOrderTxResponse, setLimitOrderTxResponse] = useState([]);
  // const [pageNumber, setpageNumber] = useState(1);
  // const [pageSize, setPageSize] = useState(5);

  const getTransactions = useCallback(
    (address) => {
      setInProgress(true);
      fetchTradingHistory(
        address,
        "/comdex.liquidity.v1beta1.MsgMarketOrder",
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            return;
          }

          setOrderTxResponse(result?.tx_responses);
          setOrderTx(result?.txs);
        }
      );
    },
    [address]
  );

  const getTransactions2 = useCallback(
    (address) => {
      setInProgress(true);
      fetchTradingHistory(
        address,
        "/comdex.liquidity.v1beta1.MsgLimitOrder",
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            return;
          }

          setLimitOrderTxResponse(result?.tx_responses);
          setLimitOrderTx(result?.txs);
        }
      );
    },
    [address]
  );

  useEffect(() => {
    getTransactions(address);
    getTransactions2(address);
  }, [address, getTransactions, getTransactions2]);

  const allTx = [...orderTx, ...limitOrderTx];
  const allTxResponse = [...orderTxResponse, ...limitOrderTxResponse];

  const combinedTx = allTxResponse.map((item, index) => ({
    tx: item?.txhash,
    time: item?.timeStamp,
    details: allTx[index]?.body?.messages[0],
  }));

  console.log(combinedTx, "hdhhhd");

  const tableData =
    combinedTx?.length &&
    combinedTx?.map((item, index) => {
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
                    item?.tx?.toUpperCase()
                  )}`}
                  rel="noreferrer"
                  target="_blank"
                  aria-label="explorer"
                >
                  {" "}
                  {item?.tx && truncateString(item?.tx, 10, 10)}
                </a>
              }{" "}
            </span>
            <Copy text={item?.tx} />
          </div>
        ),
        msgType:
          item?.details["@type"] === "/comdex.liquidity.v1beta1.MsgMarketOrder"
            ? "Market Order"
            : "Limit Order",
        date: item?.time,
      };
    });

  return (
    <div
      className={`${styles.orderbook__table__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <Table
        className="custom-table assets-table"
        columns={columns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: "100%" }}
        locale={{ emptyText: <NoDataIcon /> }}
        loading={{indicator: <Loading />, spinning: inProgress}}
      />
    </div>
  );
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(TradehistoryTable);