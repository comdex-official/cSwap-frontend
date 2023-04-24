import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { SvgIcon } from "../../components/common";
import ConnectButton from "./ConnectButton";
import LightLogo from '../../assets/images/cSwap-light-logo.svg';
import { NavLink } from "react-router-dom";
import { Dropdown } from 'antd';
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

  const {items} = [
    {
      key: '1',
      label: <div> Discord</div>
    },
    {
      key: '2',
      label: <div> Github</div>
    },
    {
      key: '3',
      label: <div> Telegram</div>
    },
    {
      key: '4',
      label: <div> Twitter</div>
    },
    {
      key: '5',
      label: <div> Medium</div>
    }
  ];  

  return (
    <nav className={isSetOnScroll ? "top_bar fixedHeaderOnScroll" : "top_bar"}>
      <div className="nav-left">
        <img className="logo" src={LightLogo} alt="Logo" />
        <ul className="menu-list">
          <li>
            <NavLink to='/trade'>
              TRADE
            </NavLink>
          </li>
          <li>
            <NavLink to='/assets'>
              ASSETS
            </NavLink>
          </li>
          <li>
            <NavLink to='/farm'>
              FARM
            </NavLink>
          </li>
          <li>
            <NavLink to='/portfolio'>
              PORTFOLIO
            </NavLink>
          </li>
          <li>
            <NavLink to='/govern'>
              GOVERN
            </NavLink>
          </li>
          <li>
            <NavLink to='/orderbook'>
              ORDERBOOK
            </NavLink>
          </li>
          <li>
            <NavLink to='/bridge'>
              BRIDGE
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="connect-button">
        <Button type="primary" className="faucet-btn btn-filled"><SvgIcon name='faucet-icon' viewbox='0 0 23 24' /> Info</Button>
        <Button type="primary" className="faucet-btn btn-filled" onClick={() => window.open("https://faucet.comdex.one/")}><SvgIcon name='faucet-icon' viewbox='0 0 23 24' /> Faucet</Button>
        {/* <ConnectButton /> */}
        <Button type="link" className="wallet-btn">oxf810...c69b21 <SvgIcon name='copy' viewbox='0 0 17.61 20.985' /></Button>
        <Dropdown menu={{items}} className="right-drop" placement="topRight">
          <SvgIcon name='ellipsis' viewbox='0 0 7 33' />
        </Dropdown>
      </div>
    </nav>
  );
};

export default NavigationBar;
