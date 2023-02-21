import "./index.scss";
import ConnectButton from "./ConnectButton";
import React, { useState, useEffect } from "react";
import ThemeToggle from "../../components/Theme/themeToggle";
import { Button } from "antd";
import { SvgIcon } from "../../components/common";
import { useLocation } from "react-router-dom";

const NavigationBar = () => {
  const [isSetOnScroll, setOnScroll] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => {
      setOnScroll(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={isSetOnScroll ? "top_bar fixedHeaderOnScroll" : "top_bar"}>
      <Button type="primary" className="faucet-btn" onClick={() => location.push('/')}><SvgIcon name='faucet-icon' viewbox='0 0 23 24' /> Faucet</Button>
      <ThemeToggle />

      <div className="connect-button">
        <ConnectButton />
      </div>
    </nav>
  );
};

export default NavigationBar;
