import { makeApiRequest, parseFullSymbol } from "./helpers.js";
import moment from "moment";
const lastBarsCache = new Map();

// DatafeedConfiguration implementation
const configurationData = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: ["1", "5", "30", "60", "240", "1D", "1W", "1M"],
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
      240: "3600",
    },
    {
      "1D": "86400",
    },
    {
      "1W": "604800",
    },
    {
      "1M": "604800",
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

async function getAllSymbols() {
  const data = await makeApiRequest("pairs/all");

  const allSymbols = data.data.map((item) => {
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
      setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (
      userInput,
      exchange,
      symbolType,
      onResultReadyCallback
    ) => {
      const symbols = await getAllSymbols();
      const newSymbols = symbols.filter((symbol) => {
        const isExchangeValid = exchange === "" || symbol.exchange === exchange;
        const isFullSymbolContainsInput =
          symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !==
          -1;
        return isExchangeValid && isFullSymbolContainsInput;
      });

      onResultReadyCallback(newSymbols);
    },

    resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      onResolveErrorCallback,
      extension
    ) => {
      const symbols = await getAllSymbols();

      const symbolItem = symbols.find(({ symbol }) => symbol === value);
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
        timezone: "Etc/UTC",
        exchange: symbolItem.exchange,
        minmov: 0,
        style: "2",
        pricescale: 10000,
        has_intraday: true,
        has_no_volume: true,
        has_weekly_and_monthly: false,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: "streaming",
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
      console.log("[getBars]: Method call", symbolInfo, resolution, from, to);
      const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
      console.log(resolution);
      // let resolutionM;
      // for (const resolutionItem of configurationData?.resulation) {
      //   return (resolutionM = resolutionItem[resolution]);
      // }
      const resolutionValue = getResolutionValue(resolution);
      console.log(resolutionValue);
      const urlParameters = {
        pair_id: symbolInfo?.pair_id,
        from: 1633044165,
        resolution: resolutionValue,
      };

      const query = Object.keys(urlParameters)
        .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
        .join("&");

      // console.log(from, to, resolution);
      // console.log(parsedSymbol);
      // console.log(urlParameters, query);
      try {
        if (from < 0) return;
        const data = await makeApiRequest(`pair/analytical/data?${query}`);
        console.log(data);
        if (data.result !== "success" || data?.data?.data.length === 0) {
          onHistoryCallback([], {
            noData: true,
          });
          return;
        }

        let bars = [];
        data?.data?.data.forEach((bar) => {
          bars = [
            ...bars,
            {
              time: moment(bar.timestamp).unix() * 1000,
              low: bar.low_price,
              high: bar.high_price,
              open: bar.open_price,
              close: bar.close_price,
              volume: bar.volume,
            },
          ];
        });

        console.log(bars);

        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.full_name, {
            ...bars[bars.length - 1],
          });
        }

        console.log(`[getBars]: returned ${bars.length} bar(s)`);
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
      subscriberUID,
      onResetCacheNeededCallback
    ) => {},

    unsubscribeBars: (subscriberUID) => {},
  };
};

// export default {

// };
