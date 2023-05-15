import React from "react";
import { NextImage } from "../../image/NextImage";
import { No_Data } from "../../image";
import styles from "./index.module.scss";

const NoDataIcon = ({ text }) => {
  return (
    <div className={styles.no_data_card}>
      <NextImage src={No_Data} alt={"logo"} />
      <div className={styles.empty_text}>{text ? `${text}` : "No Data"}</div>
    </div>
  );
};

export default NoDataIcon;
