import axios from "axios";
import { QueryClientImpl } from "comdex-codec/build/comdex/liquidity/v1beta1/query";
import Long from "long";
import { comdex } from "../../config/network";
import { APP_ID } from "../../constants/common";
import { API_URL } from "../../constants/url";
import { createQueryClient } from "../helper";

let myClient = null;

const getQueryService = (callback) => {
  if (myClient) {
    const queryService = new QueryClientImpl(myClient);

    return callback(null, queryService);
  } else {
    createQueryClient((error, client) => {
      if (error) {
        return callback(error);
      }

      myClient = client;
      const queryService = new QueryClientImpl(client);

      return callback(null, queryService);
    });
  }
};

export const queryLiquidityPairs = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pairs({
        appId: Long.fromNumber(APP_ID),
        denoms: [],
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryUserOrders = (pairId, address, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .OrdersByOrderer({
        pairId,
        appId: Long.fromNumber(APP_ID),
        orderer: address.toString(),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryOrder = (orderId, pairId, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Order({
        pairId: Long.fromNumber(pairId),
        id: Long.fromNumber(orderId),
        appId: Long.fromNumber(APP_ID),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPoolsList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pools({
        appId: Long.fromNumber(APP_ID),
        pairId: Long.fromNumber(0),
        disabled: "false",
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};

export const queryLiquidityPair = (pairId, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pair({
        appId: Long.fromNumber(APP_ID),
        pairId,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryLiquidityParams = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .GenericParams({
        appId: Long.fromNumber(APP_ID),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPoolSoftLocks = (farmer, poolId, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Farmer({
        appId: Long.fromNumber(APP_ID),
        poolId,
        farmer,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPoolCoinDeserialize = (poolId, poolTokens, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .DeserializePoolCoin({
        appId: Long.fromNumber(APP_ID),
        poolId,
        poolCoinAmount: Long.fromNumber(poolTokens),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPoolIncentives = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .PoolIncentives({
        appId: Long.fromNumber(APP_ID),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPool = (id, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pool({
        appId: Long.fromNumber(APP_ID),
        poolId: Long.fromNumber(id),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};

export const fetchRestAPRs = (callback) => {
  axios
    .get(`${API_URL}/api/v2/cswap/aprs`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchAllTokens = (callback) => {
  axios
    .get(`${API_URL}/api/v2/cswap/tokens/all`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchExchangeRateValue = (appId, pairId, callback) => {
  axios
    .get(
      `${comdex?.rest}/comdex/liquidity/v1beta1/order_books/${appId}?pair_ids=${pairId}&num_ticks=1`
    )
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};
