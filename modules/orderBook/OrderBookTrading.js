import * as React from "react";
import styles from "./OrderBook.module.scss";
import { widget } from "../../public/static/charting_library";
import { Datafeed } from "./static/datafeed";

function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export default class TVChartContainer extends React.Component {
  static defaultProps = {
    symbol: "CMDX/ATOM",
    interval: "D",
    datafeedUrl: "https://demo_feed.tradingview.com",
    libraryPath: "/static/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    allow_symbol_change: false,
  };

  tvWidget = null;

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.selectedPair &&
      prevProps.selectedPair !== this.props.selectedPair
    ) {
      const widgetOptions = {
        width: "100%",
        height: "100%",
        symbol: this.props.symbol,
        datafeed: Datafeed(this.props.selectedPair?.pair_symbol),
        interval: this.props.interval,
        container: this.ref.current,
        library_path: this.props.libraryPath,
        locale: getLanguageFromURL() || "en",

        theme: "dark",
        overrides: {
          "mainSeriesProperties.style": 2,
        },
        disabled_features: [
          "use_localstorage_for_settings",
          "left_toolbar",
          "header_symbol_search",
          "header_compare",
        ],
        enabled_features: ["study_templates", "tick_resolution"],
        charts_storage_url: this.props.chartsStorageUrl,
        charts_storage_api_version: this.props.chartsStorageApiVersion,
        client_id: this.props.clientId,
        user_id: this.props.userId,
        fullscreen: this.props.fullscreen,
        autosize: true,
        studies_overrides: this.props.studiesOverrides,
      };

      const tvWidget = new widget(widgetOptions);
      this.tvWidget = tvWidget;

      tvWidget.onChartReady(() => {
        tvWidget.headerReady().then(() => {
          const button = tvWidget.createButton();
          button.setAttribute("title", "Click to show a notification popup");
          button.classList.add("apply-common-tooltip");
          button.addEventListener("click", () =>
            tvWidget.showNoticeDialog({
              title: "Notification",
              body: "TradingView Charting Library API works correctly",
              callback: () => {
                console.log("Noticed!");
              },
            })
          );

          button.innerHTML = "Check API";
        });
      });
    }
  }

  componentWillUnmount() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  render() {
    return (
      <>
        <div ref={this.ref} className={styles.TVChartContainer} />
      </>
    );
  }
}
