import React, { useEffect, useRef } from "react";
import { widget } from '../../charting_library';
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
      theme: "Light",
      autosize: true,
      toolbar_bg: "#F1F3F6",
      enable_publishing: false,
      allow_symbol_change: true,
      show_popup_button: true,
      save_image: false,
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