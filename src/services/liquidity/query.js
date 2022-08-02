import { QueryClientImpl } from "comdex-codec/build/comdex/liquidity/v1beta1/query";
import Long from "long";
import { APP_ID } from "../../constants/common";
import { createQueryClient } from "../helper";

export const queryLiquidityPairs = (callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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

export const queryPoolsList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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

export const queryPoolSoftLocks = (depositor, poolId, callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

    queryService
      .Farmer({
        appId: Long.fromNumber(APP_ID),
        poolId,
        depositor,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPoolCoinDeserialize = (poolId, poolTokens, callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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

export const queryFarmedPoolCoin = (poolId, callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

    queryService
      .FarmedPoolCoin({
        appId: Long.fromNumber(APP_ID),
        poolId,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPool = (id, callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
