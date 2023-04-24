import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { SvgIcon } from "../../components/common";
import ThemeToggle from "../../components/Theme/themeToggle";
import ConnectButton from "./ConnectButton";
import "./index.scss";
import { useNavigate } from "react-router";
import DarkLogo from "../../assets/images/cSwap-dark-logo.svg";
import LightLogo from "../../assets/images/cSwap-light-logo.svg";
import HeaderNavTabs from "./Tabs";

const NavigationBar = () => {
	const navigate = useNavigate();
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
			<div className='top_bar_main'>
				<div className='top_bar_right'>
					<div
						className='logo'
						onClick={() =>
							navigate({
								pathname: "/",
							})
						}>
						<img className='blue' src={DarkLogo} alt='Logo' />
						<img className='white' src={LightLogo} alt='Logo' />
					</div>

					<HeaderNavTabs />
				</div>

				<div className='top_bar_left'>
					<div className='connect-button'>
						<Button
							type='primary'
							className='faucet-btn'
							onClick={() => window.open("https://transit.comdex.one")}>
							<SvgIcon name='bridge-icon' />
							Bridge
						</Button>
						<Button
							type='primary'
							className='faucet-btn'
							onClick={() => window.open("https://faucet.comdex.one/")}>
							<SvgIcon name='faucet-icon' viewbox='0 0 23 24' /> Faucet
						</Button>
					</div>
					<ThemeToggle />
					<div className='connect-button'>
						<ConnectButton />
					</div>
				</div>
			</div>
			{/* <div className="connect-button">
        <Button
          type="primary"
          className="faucet-btn"
          onClick={() => window.open("https://transit.comdex.one")}
        >
          <SvgIcon name="bridge-icon" />
          Bridge
        </Button>
        <Button
          type="primary"
          className="faucet-btn"
          onClick={() => window.open("https://faucet.comdex.one/")}
        >
          <SvgIcon name="faucet-icon" viewbox="0 0 23 24" /> Faucet
        </Button>
      </div>
      <ThemeToggle />
      <div className="connect-button">
        <ConnectButton />
      </div> */}
		</nav>
	);
};

export default NavigationBar;
