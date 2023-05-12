import * as PropTypes from "prop-types";
import { Tooltip } from "antd";
import React from "react";
import { Icon } from "../image/Icon";

const TooltipIcon = (props) => {
  return (
    <Tooltip
      overlayClassName="comdex-tooltip"
      title={props.text || "Tooltip info text"}
    >
      <Icon className={"bi bi-question-circle"} />
    </Tooltip>
  );
};

TooltipIcon.propTypes = {
  text: PropTypes.string,
};

export default TooltipIcon;
