import React from "react";
import { SvgIcon } from "../../components/common";
import { HOSTED_ON_TEXT } from "../../constants/common";
import "./index.scss";

const Footer = () => {
  return (
    <div className="footer">
      {HOSTED_ON_TEXT ? (
        <div className="footer-text"> {HOSTED_ON_TEXT}</div>
      ) : null}
      <div className="social-icons">
        <a
          aria-label="Twitter"
          title="Twitter"
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/cSwap_DEX"
        >
          <SvgIcon name="twitter" viewbox="0 0 25.617 20.825" />
        </a>
        <a
          aria-label="Telegram"
          title="Telegram"
          target="_blank"
          rel="noreferrer"
          href="https://t.me/cSwap_DEX"
        >
          <SvgIcon name="telegram" viewbox="0 0 24.635 20.66" />
        </a>
        <a
          aria-label="Discord"
          title="Discord"
          target="_blank"
          rel="noreferrer"
          href="https://bit.ly/ComdexOfficialDiscord"
        >
          <SvgIcon name="discord" viewbox="0 0 29.539 22.155" />
        </a>
        <a
          aria-label="Medium"
          title="Medium"
          target="_blank"
          rel="noreferrer"
          href="https://medium.com/@cSwap_DEX"
        >
          <SvgIcon name="medium" viewbox="0 0 25.825 20.66" />
        </a>
        <a
          aria-label="Github"
          title="Github"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/comdex-official"
        >
          <SvgIcon name="github" viewbox="0 0 22.154 21.607" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
