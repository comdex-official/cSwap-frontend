import * as PropTypes from "prop-types";
import { Col, Row } from "../../components/common";
import { Table, message } from "antd";
import { comdex } from "../../config/network";
import { connect } from "react-redux";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import { fetchTxHistory, messageTypeToText } from "../../services/transaction";
import { generateHash, truncateString } from "../../utils/string";
import Date from "./Date";
import { setTransactionHistory } from "../../actions/account";
import React, { useEffect, useState } from "react";
import Copy from "../../components/Copy";

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
  {
    title: "Height",
    dataIndex: "height",
    key: "height",
    width: 300,
  },
  {
    title: "Transaction Hash",
    dataIndex: "transactionHash",
    key: "txHash",
    width: 300,
  },
];

const History = (props) => {
  const [inProgress, setInProgress] = useState(false);
  const [pageNumber, setpageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    getTransactions(props.address, pageNumber, pageSize);
  }, []);

  const getTransactions = (address, pageNumber, pageSize) => {
    setInProgress(true);
    fetchTxHistory(address, pageNumber, pageSize, (error, result) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      props.setTransactionHistory(result.txs, result.totalCount);
    });
  };

  const tableData =
    props.history &&
    props.history.list &&
    props.history.list.length > 0 &&
    props.history.list.map((item, index) => {
      const decodedTransaction = decodeTxRaw(item.tx);
      const hash = generateHash(item.tx);

      return {
        key: index,
        transactionHash: (
          <div className="tx-hash-col">
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
        msgType: messageTypeToText(
          decodedTransaction.body.messages?.[0].typeUrl
        ),
        height: item.height,
      };
    });

  const handleChange = (value) => {
    setpageNumber(value.current);
    setPageSize(value.pageSize);
    getTransactions(props.address, value.current, value.pageSize);
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className="custom-table  history-table">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={inProgress}
              pagination={{
                total: props.history && props.history.count,
                showSizeChanger: true,
                defaultPageSize: 5,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              total={props.history && props.history.count}
              onChange={(event) => handleChange(event)}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

History.propTypes = {
  lang: PropTypes.string.isRequired,
  setTransactionHistory: PropTypes.func.isRequired,
  address: PropTypes.string,
  count: PropTypes.number,
  history: PropTypes.shape({
    count: PropTypes.number,
    list: PropTypes.arrayOf(
      PropTypes.shape({
        index: PropTypes.number,
        height: PropTypes.number,
        tx: PropTypes.any,
      })
    ),
  }),
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

export default connect(stateToProps, actionsToProps)(History);
