
import { Col, message, Row, Table } from "antd";
import { any } from "prop-types";
import React, { useCallback, useState } from "react";
import { connect } from "react-redux";
import { fetchTxHistory } from "../../services/transaction";
import { truncateString } from "../../utils/string";

const columns: any = [
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

interface HistoryProps {
  address?: any,
  setTransactionHistory?: any
  history?: any
}

const History = ({ address, setTransactionHistory, history }: HistoryProps) => {
  const [inProgress, setInProgress] = useState(false);
  const [pageNumber, setpageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getTransactions = useCallback(
    (address: string, pageNumber: number, pageSize: number) => {
      setInProgress(true);
      fetchTxHistory(address, pageNumber, pageSize, (error: any, result: any) => {
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


  const tableData = [
    {
      key: 1,
      transactionHash: (
        <div className="tx-hash-col">
          <span>
            {" "}
            {
              <a
                href={""}
                rel="noreferrer"
                target="_blank"
                aria-label="explorer"
              >
                {" "}
                {truncateString("hashsdhgweyudtr6edghewdf326rfehwgvdy63rfetydvghdew", 10, 10)}
              </a>
            }{" "}
          </span>
        </div>
      ),
      msgType: "Dummy text",
      date: "20/13/12",
      height: "764323"
    },
  ]

  const handleChange = (value: any) => {
    setpageNumber(value.current);
    setPageSize(value.pageSize);
    getTransactions(address, value.current, value.pageSize);
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col style={{ width: "100%" }}>
          <div className="custom-table  history-table">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={inProgress}
              // pagination={{
              //   total: history && history.count,
              //   showSizeChanger: true,
              //   defaultPageSize: 5,
              //   pageSizeOptions: ["5", "10", "20", "50"],
              // }}
              // total={history && history.count}
              pagination={false}
              onChange={(event) => handleChange(event)}
              // locale={{ emptyText: <NoDataIcon /> }}
              scroll={{ x: "100%" }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};


export default History;
