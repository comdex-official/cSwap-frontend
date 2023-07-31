import React, { useCallback, useState, useEffect } from 'react';
import styles from './OrderBook.module.scss';
import { Table, message } from 'antd';
import { truncateString } from '../../utils/string';
import {
  fetchTradingHistory,
} from '../../services/transaction';
import { connect } from 'react-redux';
import { comdex } from '../../config/network';
import Copy from '../../shared/components/Copy';
import moment from 'moment';
import NoDataIcon from '../../shared/components/NoDataIcon';
import Loading from '../../pages/Loading';
import { commaSeparator, formateNumberDecimalsAuto } from '../../utils/number';
import { amountConversion } from '../../utils/coin';

const columns = [
  {
    title: 'Pair',
    dataIndex: 'pair',
    key: 'pair',
    width: 300,
    sorter: (a, b) => a?.pair?.localeCompare(b?.pair),
    sortDirections: ['ascend', 'descend'],
    showSorterTooltip: false,
  },
  {
    title: 'Order Type',
    dataIndex: 'msgType',
    key: 'msgType',
    width: 300,
    sorter: (a, b) => a?.msgType?.localeCompare(b?.msgType),
    sortDirections: ['ascend', 'descend'],
    showSorterTooltip: false,
  },
  {
    title: 'Type',
    dataIndex: 'buySell',
    key: 'buySell',
    width: 300,
    render: (value) => (
      <>
        {value === 'ORDER_DIRECTION_BUY' ? (
          <div className="buy">{'Buy'}</div>
        ) : (
          <div className="sell">{'Sell'}</div> || '-'
        )}
      </>
    ),
    sorter: (a, b) => a?.buySell?.localeCompare(b?.buySell),
    sortDirections: ['ascend', 'descend'],
    showSorterTooltip: false,
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 300,
    sorter: (a, b) => Number(a?.amount) - Number(b?.amount),
    sortDirections: ['ascend', 'descend'],
    showSorterTooltip: false,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    width: 300,
    sorter: (a, b) =>
      Number(a?.price === '-' ? 0 : a?.price) -
      Number(b?.price === '-' ? 0 : b?.price),
    sortDirections: ['ascend', 'descend'],
    showSorterTooltip: false,
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: 300,
    sorter: (a, b) => moment(a?.date).unix() - moment(b?.date).unix(),
    sortDirections: ['ascend', 'descend'],
    showSorterTooltip: false,
  },
  {
    title: 'Transaction Hash',
    dataIndex: 'transactionHash',
    key: 'txHash',
    width: 300,
    align: 'right',
  },
];

const TradehistoryTable = ({ address, pairs }) => {
  const theme = 'dark';

  const [inProgress, setInProgress] = useState(false);
  const [orderTxResponse, setOrderTxResponse] = useState([]);
  const [orderTx, setOrderTx] = useState([]);
  const [limitOrderTx, setLimitOrderTx] = useState([]);
  const [limitOrderTxResponse, setLimitOrderTxResponse] = useState([]);
 
  const getTransactions = useCallback(
    (address) => {
      setInProgress(true);
      fetchTradingHistory(address, 'market_order', (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }

        setOrderTxResponse(result?.tx_responses);
        setOrderTx(result?.txs);
      });
    },
    [address]
  );

  const getTransactions2 = useCallback(
    (address) => {
      setInProgress(true);
      fetchTradingHistory(address, 'limit_order', (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }

        setLimitOrderTxResponse(result?.tx_responses);
        setLimitOrderTx(result?.txs);
      });
    },
    [address]
  );

  useEffect(() => {
    getTransactions(address);
    getTransactions2(address);
  }, [address, getTransactions, getTransactions2]);

  const allTx = [...orderTx, ...limitOrderTx];
  const allTxResponse = [...orderTxResponse, ...limitOrderTxResponse];

  let combinedTx = allTxResponse.map((item, index) => ({
    key: index,
    tx: item?.txhash,
    time: item?.timestamp,
    details: allTx[index]?.body?.messages[0],
  }));

  combinedTx = combinedTx.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });

  const getPair = (pairId) => {
    const pair = pairs && pairs.filter((item) => item?.pair_id === pairId);
    return pair[0]?.pair_symbol;
  };

  const tableData =
    combinedTx?.length &&
    combinedTx?.map((item, index) => {
      return {
        key: index,
        transactionHash: (
          <div
            className="tx-hash-col d-flex"
            style={{ columnGap: '5px', justifyContent: 'flex-end' }}
          >
            <span>
              {' '}
              {
                <a
                  href={`${comdex.explorerUrlToTx.replace(
                    '{txHash}',
                    item?.tx?.toUpperCase()
                  )}`}
                  rel="noreferrer"
                  target="_blank"
                  aria-label="explorer"
                >
                  {' '}
                  {item?.tx && truncateString(item?.tx, 10, 10)}
                </a>
              }{' '}
            </span>
            <Copy text={item?.tx} />
          </div>
        ),
        msgType:
          item?.details['@type'] === '/comdex.liquidity.v1beta1.MsgMarketOrder'
            ? 'Market'
            : 'Limit',
        buySell: item?.details?.direction,
        amount: amountConversion(item?.details?.amount || 0),
        price:
          item?.details['@type'] === '/comdex.liquidity.v1beta1.MsgMarketOrder'
            ? '-'
            : formateNumberDecimalsAuto({
                price: Number(
                  commaSeparator(
                    formateNumberDecimalsAuto({
                      price: item?.details?.price || 0,
                      minDecimal: 3,
                    })
                  )
                ),
                minDecimal: 3,
              }),

        date: moment(item?.time).format('LLL'),
        pair: getPair(item?.details?.pair_id)
          ? getPair(item?.details?.pair_id)?.replace(/\//g, '-')
          : '-',
      };
    });

  return (
    <div
      className={`${styles.orderbook__table__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <Table
        className="custom-table2 assets-table"
        columns={columns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: '100%' }}
        locale={{
          emptyText: <NoDataIcon text="Trading History Not Available" />,
        }}
        loading={{ indicator: <Loading height={60} />, spinning: inProgress }}
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
