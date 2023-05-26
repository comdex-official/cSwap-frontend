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
      <div className="tooltip-icon">
        <Icon className={"bi bi-question-circle"} />
      </div>
    </Tooltip>
  );
};

TooltipIcon.propTypes = {
  text: PropTypes.string,
};

export default TooltipIcon;
