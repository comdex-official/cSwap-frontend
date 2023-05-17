import React, { useEffect, useRef } from "react";
import Datafeed from "./static/datafeed";

let tvScriptLoadingPromise;

export default function TradingViewWidget() {
  const onLoadScriptRef = useRef();

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => (onLoadScriptRef.current = null);

    function createWidget() {
      if (
        document.getElementById("tradingview_2bc9b") &&
        "TradingView" in window
      ) {
        console.log("ggggg", window.TradingView);
        new window.TradingView.widget({
          library_path:
            "https://charting-library.tradingview-widget.com/charting_library/",
          width: "100%",
          height: "100%",
          symbol: "Atom",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "2",
          datafeed: Datafeed,
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          clientId: "tradingview.com",
          withdateranges: true,
          range: "YTD",
          allow_symbol_change: true,
          container_id: "tradingview_2bc9b",
          debug: true,
          userId: "public_user_id",
        });
      }
    }
  }, []);

  return (
    <div className="tradingview-widget-container">
      <div id="tradingview_2bc9b" />
    </div>
  );
}
