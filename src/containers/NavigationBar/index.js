import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { SvgIcon } from "../../components/common";
import ThemeToggle from "../../components/Theme/themeToggle";
import ConnectButton from "./ConnectButton";
import "./index.scss";

const NavigationBar = () => {
  const [isSetOnScroll, setOnScroll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setOnScroll(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={isSetOnScroll ? "top_bar fixedHeaderOnScroll" : "top_bar"}>
      <Button type="primary" className="faucet-btn" onClick={() => window.open("https://faucet.comdex.one/")}><SvgIcon name='faucet-icon' viewbox='0 0 23 24' /> Faucet</Button>
      <ThemeToggle />
      <div className="connect-button">
        <ConnectButton />
      </div>
    </nav>
  );
};

export default NavigationBar;
