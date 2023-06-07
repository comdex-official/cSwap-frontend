import {
  detectBestDecimalsDisplay,
  makeApiRequest,
  parseFullSymbol,
} from "./helpers.js";
import moment from "moment";
const lastBarsCache = new Map();

// DatafeedConfiguration implementation
const configurationData = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: ["1", "5", "30", "60", "1D", "1W", "1M"],
  // supported_resolutions: ['60', '300', '600', '900', '1800', '3600', '21600', '43200', '64800', '86400', '604800', '2592000'],

  resulation: [
    {
      1: "60",
    },
    {
      5: "300",
    },
    {
      30: "1800",
    },
    {
      60: "3600",
    },

    {
      "1D": "86400",
    },
    {
      "1W": "604800",
    },
    {
      "1M": "2592000",
    },
  ],
  // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
  exchanges: [
    {
      value: "Bitfinex",
      name: "Bitfinex",
      desc: "Bitfinex",
    },
    {
      value: "Kraken",
      // Filter name
      name: "Kraken",
      // Full exchange name displayed in the filter popup
      desc: "Kraken bitcoin exchange",
    },
  ],
  // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
  symbols_types: [
    {
      name: "crypto",
      value: "crypto",
    },
  ],
};

const getResolutionValue = (resolution) => {
  const matchingResolution = configurationData?.resulation.find(
    (item) => Object.keys(item)[0] === resolution
  );
  return matchingResolution ? matchingResolution[resolution] : null;
};

const handleIncreaseLength = (dataArray) => {
  if (dataArray.length <= 200) {
    const newArray = [...dataArray];

    for (let i = 0; i < 500; i++) {
      newArray.push({
        close_price: 0,
        high_price: 0,
        low_price: 0,
        open_price: 0,
        timestamp: "2020-02-08T00:00:27.131819Z",
        volume: 0,
      });
    }
    return newArray;
  } else {
    return dataArray;
  }
};

async function getAllSymbols() {
  const data = await makeApiRequest("pairs/all");

  const allSymbols = data?.data?.map((item) => {
    return {
      pairId: item?.pair_id,
      symbol: item.pair_symbol,
      full_name: "",
      description: item.pair_symbol,
      exchange: "",
      type: "crypto",
    };
  });

  return allSymbols;
}

export const Datafeed = (value) => {
  return {
    onReady: (callback) => {
      callback({
        exchanges: [],
        currency_codes: [],
        units: [],
        supported_resolutions: configurationData?.supported_resolutions,
        symbols_types: [],
      });
      // setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (
      userInput,
      exchange,
      symbolType,
      onResultReadyCallback
    ) => {
      onResultReadyCallback([]);
    },

    resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      onResolveErrorCallback,
      extension
    ) => {
      const symbols = await getAllSymbols();

      const symbolItem =
        symbols && symbols.find(({ symbol }) => symbol === value);
      if (!symbolItem) {
        onResolveErrorCallback("cannot resolve symbol");
        return;
      }

      const symbolInfo = {
        pair_id: symbolItem.pairId,
        ticker: symbolItem.full_name,
        name: symbolItem.symbol,
        description: symbolItem.description,
        type: symbolItem.type,
        session: "24x7",
        exchange: symbolItem.exchange,
        minmov: 1,
        style: "2",
        min_bar_spacing: "0.0000000",
        has_seconds: true,
        has_ticks: true,
        pricescale: Math.pow(10, detectBestDecimalsDisplay(0.00434)),
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions,
        // volume_precision: 2,
        // data_status: "streaming",
      };

      onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback
    ) => {
      const { from, to, firstDataRequest } = periodParams;
      console.log("[getBars]: Method call",);

      const resolutionValue = getResolutionValue(resolution);

      const urlParameters = {
        pair_id: symbolInfo?.pair_id,
        from: 1633044165,
        resolution: resolutionValue,
      };

      const query = Object.keys(urlParameters)
        .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
        .join("&");

      try {
        const data = await makeApiRequest(`pair/analytical/data?${query}`);
       
        if (data.result !== "success" || data?.data?.data.length === 0) {
          onHistoryCallback([], {
            noData: true,
          });
          return;
        }
        const newData = handleIncreaseLength(data?.data?.data);
        let bars = [];
     
        newData.forEach((bar) => {
          bars.push({
            time: moment(bar.timestamp).unix() * 1000,
            low: bar.low_price,
            high: bar.high_price,
            open: bar.open_price,
            close: bar.close_price,
            volume: bar.volume,
          });
        });

        // if (firstDataRequest) {
        //   lastBarsCache.set(symbolInfo.full_name, {
        //     ...bars[bars.length - 1],
        //   });
        // }

        console.log(`[getBars]: returned bar(s)`);
        onHistoryCallback(bars, {
          noData: false,
        });
      } catch (error) {
        console.log("[getBars]: Get error", error);
        onErrorCallback(error);
      }
    },

    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      onResetCacheNeededCallback
    ) => {},
    unsubscribeBars: (subscriberUID) => {},
  };
};

// export default {

// };
