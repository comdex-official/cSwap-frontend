import styles from "./Portfolio.module.scss";
import { HighchartsReact } from "highcharts-react-official";
import Highcharts from "highcharts";
import Tab from "../../shared/components/tab/Tab";
import Search from "../../shared/components/search/Search";
import PortfolioTable from "./PortfollioTable";
import { Button, Input, message, Switch, Table, Tabs } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setAccountBalances } from "../../actions/account";
import { setLPPrices, setMarkets } from "../../actions/oracle";
import AssetList from "../../config/ibc_assets.json";
import { cmst, comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
import { fetchRestPrices } from "../../services/oracle/query";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
} from "../../utils/coin";
import {
  commaSeparator,
  formateNumberDecimalsAuto,
  marketPrice,
} from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import { Icon } from "@/shared/image/Icon";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

const Portfolio = ({
  lang,
  assetBalance,
  balances,
  markets,
  parent,
  refreshBalance,
  assetMap,
  assetDenomMap,
  setMarkets,
  setLPPrices,
  lpPrices,
}) => {
  const theme = "dark";

  const [active, setActive] = useState("Assets");

  const handleActive = (item) => {
    setActive(item);
  };

  const TabData = ["Assets", "Liquidity", "History"];

  const [pricesInProgress, setPricesInProgress] = useState(false);
  const [isHideToggleOn, setHideToggle] = useState(false);
  const [searchKey, setSearchKey] = useState();
  const [filterValue, setFilterValue] = useState("1");

  const dispatch = useDispatch();

  const tabItems = [
    {
      key: "1",
      label: "Assets",
    },
    {
      key: "2",
      label: "LF Tokens",
    },
  ];

  const handleBalanceRefresh = () => {
    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });

    updatePrices();
  };

  useEffect(() => {
    setHideToggle(localStorage.getItem("hideToggle") === "true");
  }, []);

  const handleHideSwitchChange = (value) => {
    localStorage.setItem("hideToggle", value);
    setHideToggle(value);
  };

  const onSearchChange = (searchKey) => {
    setSearchKey(searchKey.trim().toLowerCase());
  };

  const updatePrices = () => {
    setPricesInProgress(true);

    fetchRestPrices((error, result) => {
      setPricesInProgress(false);

      if (error) {
        message.error(error);
        return;
      }

      setMarkets(result.data);
    });
  };

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
    },
    {
      title: "No. of Tokens",
      dataIndex: "noOfTokens",
      key: "noOfTokens",
      align: "left",
      render: (tokens) => (
        <>
          <p>{commaSeparator(Number(tokens || 0))}</p>
        </>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "left",
      width: 150,
      render: (price) => (
        <>
          <p className="text-left">
            ${formateNumberDecimalsAuto({ price: Number(price?.value) || 0 })}
          </p>
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "left",
      render: (amount) => (
        <>
          <p>
            $
            {commaSeparator(
              Number(amount?.value || 0).toFixed(DOLLAR_DECIMALS)
            )}
          </p>
        </>
      ),
    },
    {
      title: "IBC Deposit",
      dataIndex: "ibcdeposit",
      key: "ibcdeposit",
      align: "left",
      // width: 210,
      render: (value) => {
        if (value) {
          return value?.depositUrlOverride ? (
            <Button type="primary" size="small">
              <a
                href={value?.depositUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Deposit{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <Icon className={"bi bi-x-lg"} />
                </span>
              </a>
            </Button>
          ) : (
            <Deposit
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
            />
          );
        }
      },
    },
    {
      title: "IBC Withdraw",
      dataIndex: "ibcwithdraw",
      key: "ibcwithdraw",
      width: 110,
      render: (value) => {
        if (value) {
          return value?.withdrawUrlOverride ? (
            <Button type="primary" size="small">
              <a
                href={value?.withdrawUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Withdraw{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <Icon className={"bi bi-x-lg"} />
                </span>
              </a>
            </Button>
          ) : (
            <Withdraw
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
            />
          );
        }
      },
    },
  ];

  const getPrice = (denom) => {
    return marketPrice(markets, denom) || 0;
  };

  let appAssets = AssetList?.tokens?.filter(
    (item) => item?.ibcDenomHash === assetDenomMap?.[item?.ibcDenomHash]?.denom
  );

  let ibcBalances = appAssets?.map((token) => {
    const ibcBalance = balances.find(
      (item) => item.denom === token?.ibcDenomHash
    );

    const value =
      getPrice(ibcBalance?.denom) *
      amountConversion(
        ibcBalance?.amount,
        assetMap[ibcBalance?.denom]?.decimals
      );
    return {
      chainInfo: getChainConfig(token),
      coinMinimalDenom: token?.coinMinimalDenom,
      symbol: token?.symbol,
      balance: {
        amount: ibcBalance?.amount
          ? amountConversion(
              ibcBalance.amount,
              assetMap[ibcBalance?.denom]?.decimals
            )
          : 0,
        value: value || 0,
        denom: ibcBalance?.denom,
      },

      sourceChannelId: token.comdexChannel,
      destChannelId: token.channel,
      ibcDenomHash: token?.ibcDenomHash,
      explorerUrlToTx: token?.explorerUrlToTx,
      depositUrlOverride: token?.depositUrlOverride,
      withdrawUrlOverride: token?.withdrawUrlOverride,
    };
  });

  const nativeCoin = balances.filter(
    (item) => item.denom === comdex?.coinMinimalDenom
  )[0];
  const nativeCoinValue = getPrice(nativeCoin?.denom) * nativeCoin?.amount;

  const cmstCoin = balances.filter(
    (item) => item.denom === cmst?.coinMinimalDenom
  )[0];

  const cmstCoinValue = getPrice(cmstCoin?.denom) * cmstCoin?.amount;

  const harborCoin = balances.filter(
    (item) => item.denom === harbor?.coinMinimalDenom
  )[0];
  const harborCoinValue = getPrice(harborCoin?.denom) * harborCoin?.amount;

  let currentChainData = [
    {
      key: comdex.chainId,
      symbol: comdex?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <Icon className={"bi bi-x-lg"} />
            </div>{" "}
            {denomConversion(comdex?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: nativeCoin?.amount ? amountConversion(nativeCoin.amount) : 0,
      price: {
        value: getPrice(comdex?.coinMinimalDenom),
        denom: comdex?.coinMinimalDenom,
      },

      amount: {
        value: amountConversion(nativeCoinValue || 0),
        denom: comdex?.coinMinimalDenom,
      },
    },
    {
      key: cmst.coinMinimalDenom,
      symbol: cmst?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <Icon className={"bi bi-x-lg"} />
            </div>{" "}
            {denomConversion(cmst?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: cmstCoin?.amount ? amountConversion(cmstCoin.amount) : 0,
      price: {
        value: getPrice(cmst?.coinMinimalDenom),
        denom: cmst?.coinMinimalDenom,
      },

      amount: {
        value: amountConversion(cmstCoinValue || 0),
        denom: cmst?.coinMinimalDenom,
      },
    },
    {
      key: harbor.coinMinimalDenom,
      symbol: harbor?.symbol,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <Icon className={"bi bi-x-lg"} />
            </div>{" "}
            {denomConversion(harbor?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: harborCoin?.amount ? amountConversion(harborCoin.amount) : 0,
      price: {
        value: getPrice(harbor?.coinMinimalDenom),
        denom: harbor?.coinMinimalDenom,
      },

      amount: {
        value: amountConversion(harborCoinValue || 0),
        denom: harbor?.coinMinimalDenom,
      },
    },
  ];

  ibcBalances =
    parent && parent === "portfolio"
      ? ibcBalances.filter((item) => item?.balance?.amount > 0)
      : ibcBalances;

  const tableIBCData =
    ibcBalances &&
    ibcBalances.map((item) => {
      return {
        key: item?.coinMinimalDenom,
        symbol: item?.symbol,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <Icon className={"bi bi-x-lg"} />
              </div>{" "}
              {denomConversion(item?.ibcDenomHash)}{" "}
            </div>
          </>
        ),
        noOfTokens: Number(item?.balance?.amount || 0)?.toFixed(
          comdex?.coinDecimals
        ),
        price: {
          value: getPrice(item?.ibcDenomHash),
          denom: item?.ibcDenomHash,
        },
        amount: item.balance,
        ibcdeposit: item,
        ibcwithdraw: item,
      };
    });

  let allTableData = Lodash.concat(currentChainData, tableIBCData);

  let tableData =
    isHideToggleOn && filterValue === "1"
      ? allTableData?.filter((item) => Number(item?.noOfTokens) > 0)
      : allTableData;

  tableData =
    searchKey && filterValue === "1"
      ? tableData?.filter((item) => {
          return item?.symbol?.toLowerCase().includes(searchKey?.toLowerCase());
        })
      : tableData;

  let balanceExists = allTableData?.find(
    (item) => Number(item?.noOfTokens) > 0
  );

  const onChange = (key) => {
    setFilterValue(key);
  };

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 220,
      width: 220,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: "137.87 USD",
      verticalAlign: "middle",
      floating: true,
      style: {
        fontSize: "36px",
        fontWeight: "600",
        fontFamily: "Montserrat",
        color: "#FFFFFF",
      },
    },
    subtitle: {
      floating: true,
      style: {
        fontSize: "25px",
        fontWeight: "500",
        fontFamily: "Lexend Deca",
        color: "#fff",
      },
      y: 70,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "100%",
        innerSize: "75%",
        borderWidth: 0,
        className: "highchart_chart",
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: true,
          },
        },
        name: "",
        data: [
          {
            name: "Asset Balance",
            y: 13.52,
            color: "#1E3B6F",
          },
        ],
      },
    ],
  };

  return (
    <div
      className={`${styles.portfolio__wrap} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.portfolio__main} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.portfolio__header__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.portfolio__header__element__wrap} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <HighchartsReact highcharts={Highcharts} options={Options} />
            {/* <div
              className={`${styles.portfolio__element__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.portfolio__element__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'137.87 USD'}
              </div>
            </div> */}
          </div>

          <div
            className={`${styles.portfolio__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"Total Value"}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"137.87 USD"}
            </div>
          </div>
          <div
            className={`${styles.portfolio__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div />
              {"Asset Balance"}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"137.87 USD"}
            </div>
          </div>
          <div
            className={`${styles.portfolio__element} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              <div /> {"Farm Balance"}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${
                theme === "dark" ? styles.dark : styles.light
              }`}
            >
              {"137.87 USD"}
            </div>
          </div>
        </div>
        <div
          className={`${styles.portfolio__body__wrap} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.portfolio__tab} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <Tab data={TabData} active={active} handleActive={handleActive} />
          </div>
          <div
            className={`${styles.portfolio__search} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            <Search theme={theme} type={1} placeHolder="Search Asset.." />
          </div>
        </div>
        <div
          className={`${styles.portfolio__table} ${
            theme === "dark" ? styles.dark : styles.light
          }`}
        >
          <PortfolioTable theme={theme} active={active} />
        </div>
      </div>
    </div>
  );
};

Assets.propTypes = {
  lang: PropTypes.string.isRequired,
  setAccountBalances: PropTypes.func.isRequired,
  setMarkets: PropTypes.func.isRequired,
  setLPPrices: PropTypes.func.isRequired,
  assetBalance: PropTypes.number,
  assetMap: PropTypes.object,
  assetDenomMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  lpPrices: PropTypes.object,
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    lpPrices: state.oracle.lpPrice.list,
    refreshBalance: state.account.refreshBalance,
    assetMap: state.asset.map,
    assetDenomMap: state.asset.appAssetMap,
  };
};

const actionsToProps = {
  setAccountBalances,
  setMarkets,
  setLPPrices,
};

export default connect(stateToProps, actionsToProps)(Portfolio);
