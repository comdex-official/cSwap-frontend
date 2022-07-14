import * as PropTypes from "prop-types";
import { CopyToClipboard } from "react-copy-to-clipboard";
import React, { useState } from "react";
import { SvgIcon } from "../common";
import { Tooltip } from "antd";
import "./index.scss";

const Copy = ({ text }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const onCopy = () => {
    setOpen(true);
    setTimeout(handleClose, 1000);
  };

  return (
    <div
      className="copy-section"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Tooltip arrow visible={open} color="#FE4350" title="Copied!">
        <CopyToClipboard onCopy={onCopy} text={text}>
          <SvgIcon name="copy" viewbox="0 0 17.61 20.985" />
        </CopyToClipboard>
      </Tooltip>
    </div>
  );
};

Copy.propTypes = {
  text: PropTypes.string,
};

export default Copy;
