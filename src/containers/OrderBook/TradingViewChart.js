import React, { useEffect, useRef } from "react";
import { widget } from "../../charting_library";
import Datafeed from "./datafeed";

const TradingViewChart = ({ symbol = "Bitfinex:BTC/USD" }) => {
  const chartContainerRef = useRef(null);
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const tradingViewWidget = new widget({
      symbol: symbol,
      interval: "D",
      container_id: chartContainerRef.current.id,
      datafeed: Datafeed,
      library_path: "/charting_library/",
      locale: "en",
      theme: "dark",
      autosize: true,
      enable_publishing: false,
      allow_symbol_change: true,
      show_popup_button: true,
      save_image: false,
      disabled_features: [
        "volume_force_overlay",
        "header_compare",
        "header_interval_dialog_button",
        "show_interval_dialog_on_key_press",
        "header_symbol_search",
        "header_saveload",
      ],
      enabled_features: [
        "move_logo_to_main_pane",
        "hide_last_na_study_output",
        "clear_bars_on_series_error",
        "dont_show_boolean_study_arguments",
        "narrow_chart_enabled",
        "side_toolbar_in_fullscreen_mode",
        "save_chart_properties_to_local_storage",
        "use_localstorage_for_settings",
      ],
      studies_overrides: {},
      overrides: {},
    });
    return () => {
      tradingViewWidget && tradingViewWidget.remove();
    };
  }, [symbol]);
  return (
    <div
      ref={chartContainerRef}
      id={`tradingview-chart-${Date.now()}`}
      style={{ width: "100%", height: "600px" }}
    ></div>
  );
};
export default TradingViewChart;
