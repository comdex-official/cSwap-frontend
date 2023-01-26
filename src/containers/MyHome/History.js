import { decodeTxRaw } from "@cosmjs/proto-signing";
import { message, Table } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { setTransactionHistory } from "../../actions/account";
import { Col, Row } from "../../components/common";
import NoDataIcon from "../../components/common/NoDataIcon";
import Copy from "../../components/Copy";
import { comdex } from "../../config/network";
import { abbreviateMessage, fetchTxHistory } from "../../services/transaction";
import { generateHash, truncateString } from "../../utils/string";
import Date from "./Date";

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
    align: "right",
  },
];

const History = ({ address, setTransactionHistory, history }) => {
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
        msgType: abbreviateMessage(decodedTransaction.body.messages),
        date: item?.height,
        height: item.height,
      };
    });

  const handleChange = (value) => {
    setpageNumber(value.current);
    setPageSize(value.pageSize);
    getTransactions(address, value.current, value.pageSize);
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
                total: history && history.count,
                showSizeChanger: true,
                defaultPageSize: 5,
                pageSizeOptions: ["5", "10", "20", "50"],
              }}
              total={history && history.count}
              onChange={(event) => handleChange(event)}
              locale={{ emptyText: <NoDataIcon /> }}
              scroll={{ x: "100%" }}
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
