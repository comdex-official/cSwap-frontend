import React, { useEffect } from "react";
import styles from "./OrderBook.module.scss";
import { Table } from "antd";
import NoDataIcon from "../../shared/components/NoDataIcon";
import { useRouter } from "next/router";

const OrderbookTable = ({ openOrdersData, ordersTablecolumns }) => {
  const theme = "dark";

 

    const handleClick = () =>{
      const targetElement = document.getElementById('spot');
      if (targetElement) {
      
          targetElement.scrollIntoView({ behavior: 'smooth' });
        
      }
    }
    

  return (
    <div
      className={`${styles.orderbook__table__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <Table
        className="custom-table assets-table"
        dataSource={openOrdersData}
        columns={ordersTablecolumns}
        pagination={false}
        scroll={{ x: "100%" }}
        locale={{
          emptyText: (
            <NoDataIcon
              text="No Limit Orders"
              button={true}
              buttonText={"Place Limit Order"}
               OnClick={()=>handleClick()}
            />
          ),
        }}
      />
      {/* <div
        className={`${styles.orderbook__table__main} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.orderbook__table__head} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__table__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Pair"}
          </div>
          <div
            className={`${styles.orderbook__table__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Type"}
          </div>
          <div
            className={`${styles.orderbook__table__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Amount"}
          </div>
          <div
            className={`${styles.orderbook__table__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Price"}
          </div>
          <div
            className={`${styles.orderbook__table__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Time"}
          </div>
          <div
            className={`${styles.orderbook__table__title} ${styles.lastChild} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Action"}
          </div>
        </div>
        <div
          className={`${styles.orderbook__table__body__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          {openOrdersData.length === 0 ? (
            <div
              className={`${styles.orderbook__lower__table__head__title} ${
                styles.no__data
              } ${theme === "dark" ? styles.dark : styles.light}`}
            >
              {"No Data"}
            </div>
          ) : (
            openOrdersData &&
            openOrdersData.map((item) => (
              <div
                className={`${styles.orderbook__table__body} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
                key={item.id}
              >
                <div
                  className={`${styles.orderbook__table__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"CMDX/CMST"}
                </div>
                <div
                  className={`${styles.orderbook__table__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"Buy"}
                </div>
                <div
                  className={`${styles.orderbook__table__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"1.5"}
                </div>
                <div
                  className={`${styles.orderbook__table__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"8,123"}
                </div>
                <div
                  className={`${styles.orderbook__table__title} ${
                    theme === "dark" ? styles.dark : styles.light
                  }`}
                >
                  {"01/01/2023 16:23"}
                </div>
                <div
                  className={`${styles.orderbook__table__title} ${
                    styles.action
                  } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  {"Cancel"}
                </div>
              </div>
            ))
          )}
        </div>
      </div> */}
    </div>
  );
};

export default OrderbookTable;
