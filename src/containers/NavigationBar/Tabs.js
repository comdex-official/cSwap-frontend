import { message } from "antd";
import { encode } from "js-base64";
import * as PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import { setAccountAddress, setAccountName } from "../../actions/account";
import { fetchKeplrAccountName, initializeChain } from "../../services/keplr";
import variables from "../../utils/variables";
import { tabsList } from "../SideBar/TabsList";

const HeaderNavTabs = ({ setAccountAddress, lang, setAccountName }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const route = location.pathname && location.pathname.split("/")[1];

	window.addEventListener("keplr_keystorechange", () => {
		handleConnectToWallet();
	});

	window.addEventListener("leap_keystorechange", () => {
		handleConnectToWallet();
	});

	const handleConnectToWallet = () => {
		let walletType = localStorage.getItem("loginType");

		initializeChain(walletType, (error, account) => {
			if (error) {
				message.error(error);
				return;
			}

			fetchKeplrAccountName().then((name) => {
				setAccountName(name);
			});

			setAccountAddress(account.address);
			localStorage.setItem("ac", encode(account.address));
			localStorage.setItem("loginType", walletType || "keplr");
		});
	};

	const a11yProps = (index) => {
		return {
			id: `simple-tab-${index}`,
		};
	};

	return (
		<div className='vertical_tabs'>
			{tabsList.map((item) => {
				return (
					<div
						key={item.index}
						className={
							"tab " +
							(item.route === "trade" && !route
								? "active_tab"
								: item.route === route
								? "active_tab"
								: "")
						}
						value={item.value}
						onClick={() => {
							navigate("/" + item.route);
						}}
						{...a11yProps(0)}>
						<div className='tab-inner'>{variables[lang][item.langKey]}</div>
					</div>
				);
			})}
		</div>
	);
};

HeaderNavTabs.propTypes = {
	lang: PropTypes.string.isRequired,
	setAccountAddress: PropTypes.func.isRequired,
	setAccountName: PropTypes.func.isRequired,
};

const stateToProps = (state) => {
	return {
		lang: state.language,
	};
};

const actionToProps = {
	setAccountAddress,
	setAccountName,
};

export default connect(stateToProps, actionToProps)(HeaderNavTabs);
