import * as PropTypes from "prop-types";
import { SvgIcon } from "./common";
import { Tooltip } from "antd";
import React from "react";

const TooltipIcon = (props) => {
  return (
    <Tooltip
      overlayClassName="comdex-tooltip"
      title={props.text || "Tooltip info text"}
    >
      <SvgIcon className="tooltip-icon" name="info-icon" />
    </Tooltip>
  );
};

TooltipIcon.propTypes = {
  text: PropTypes.string,
};

export default TooltipIcon;
