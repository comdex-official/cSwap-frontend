import React from 'react';
import styles from './OrderBook.module.scss';
import { Table } from 'antd';
import NoDataIcon from '../../shared/components/NoDataIcon';

const OrderbookTable = ({ openOrdersData, ordersTablecolumns }) => {
  const theme = 'dark';

  const handleClick = () => {
    const targetElement = document.getElementById('spot');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`${styles.orderbook__table__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <Table
        className="custom-table2 assets-table"
        dataSource={openOrdersData}
        columns={ordersTablecolumns}
        pagination={false}
        scroll={{ x: '100%' }}
        locale={{
          emptyText: (
            <NoDataIcon
              text="No Limit Orders"
              button={true}
              buttonText={'Place Limit Order'}
              OnClick={() => handleClick()}
            />
          ),
        }}
      />
    </div>
  );
};

export default OrderbookTable;
