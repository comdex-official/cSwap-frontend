import "./index.scss";
import ConnectButton from "./ConnectButton";
import React, { useState, useEffect } from "react";
import ThemeToggle from "../../components/Theme/themeToggle";

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
      <ThemeToggle />

      <div className="connect-button">
        <ConnectButton />
      </div>
    </nav>
  );
};

export default NavigationBar;
