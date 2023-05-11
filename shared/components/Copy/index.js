import { Tooltip } from "antd";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
// import "./index.scss";

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
      <Tooltip arrow open={open} color="#FE4350" title="Copied!">
        {/* <CopyToClipboard onCopy={onCopy} text={text}>
          C
        </CopyToClipboard> */}
        c
      </Tooltip>
    </div>
  );
};

Copy.propTypes = {
  text: PropTypes.string,
};

export default Copy;
