import "./index.scss";
import React from "react";
import { SvgIcon } from "../../components/common";

const Footer = () => {
  return (
    <div className="footer">
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
          aria-label="Forum"
          title="Forum"
          target="_blank"
          rel="noreferrer"
          href="https://forum.comdex.one/"
        >
          <SvgIcon name="forum" viewbox="0 0 20 20" />
        </a>
        <a
          aria-label="Linkedin"
          title="Linkedin"
          target="_blank"
          rel="noreferrer"
          href="https://www.linkedin.com/showcase/cswap-dex/"
        >
          <SvgIcon name="linkedin" viewbox="0 0 19.975 19.975" />
        </a>
        <a
          aria-label="Reddit"
          title="Reddit"
          target="_blank"
          rel="noreferrer"
          href="https://www.reddit.com/r/ComdexOne/"
        >
          <SvgIcon name="reddit" viewbox="0 0 20 20" />
        </a>
        <a
          aria-label="Instagram"
          title="Instagram"
          target="_blank"
          rel="noreferrer"
          href="https://www.instagram.com/comdexone/"
        >
          <SvgIcon name="instagram" viewbox="0 0 19.975 19.97" />
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
        <a
          aria-label="Newsletter"
          title="Newsletter"
          target="_blank"
          rel="noreferrer"
          href="https://comdexnewsletter.com/subscribe"
        >
          <SvgIcon name="newsletter" viewbox="0 0 23.915 19.132" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
