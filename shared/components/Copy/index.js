import { Tooltip } from "antd";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Icon } from "../../image/Icon";
import styles from "./index.module.scss";

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
      className={styles.copy_section}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Tooltip
        open={open}
        color="#FE4350"
        title="Copied!"
        overlayClassName="tooltop-all"
      >
        <CopyToClipboard onCopy={onCopy} text={text}>
          <div>
            <Icon className={"bi bi-clipboard2"} />
          </div>
        </CopyToClipboard>
      </Tooltip>
    </div>
  );
};

Copy.propTypes = {
  text: PropTypes.string,
};

export default Copy;
