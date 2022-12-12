import React from "react";
import { SvgIcon } from "../";
import "./index.scss";

const NoDataIcon = ({ text }) => {
  return (
    <div className="no-data-card">
      <SvgIcon name="nodata-icon" viewbox="0 0 110.441 126.947" />
      <div className="empty-text">{text ? `${text}` : "No Data"}</div>
    </div>
  );
};

export default NoDataIcon;
