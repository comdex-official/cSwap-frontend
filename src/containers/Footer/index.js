import "./index.scss";
import React from "react";
import { SvgIcon } from "../../components/common";

const Footer = () => {
  return (
    <div className="footer">
      <div className="social-icons">
        <a
          aria-label="Discord"
          target="_blank"
          rel="noreferrer"
          href="https://discord.com/invite/7vjPvWKKMT"
        >
          <SvgIcon name="discord" viewbox="0 0 29.539 22.155" />
        </a>
        <a
          aria-label="Github"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/comdex-official"
        >
          <SvgIcon name="github" viewbox="0 0 22.154 21.607" />
        </a>
        <a
          aria-label="Telegram"
          target="_blank"
          rel="noreferrer"
          href="https://t.me/ComdexChat"
        >
          <SvgIcon name="telegram" viewbox="0 0 24.635 20.66" />
        </a>
        <a
          aria-label="Twitter"
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/ComdexOfficial"
        >
          <SvgIcon name="twitter" viewbox="0 0 25.617 20.825" />
        </a>
        <a
          aria-label="Medium"
          target="_blank"
          rel="noreferrer"
          href="https://blog.comdex.one"
        >
          <SvgIcon name="medium" viewbox="0 0 25.825 20.66" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
