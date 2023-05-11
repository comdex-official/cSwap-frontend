import axios from 'axios';
import { QueryClientImpl } from 'comdex-codec/build/comdex/liquidity/v1beta1/query';
import Long from 'long';
import { createQueryClient } from '../helper';
import { envConfigResult } from '@/config/envConfig';

let myClient: any = null;

const getQueryService = (callback: any) => {
  if (myClient) {
    const queryService = new QueryClientImpl(myClient);

    return callback(null, queryService);
  } else {
    createQueryClient((error: any, client: any) => {
      if (error) {
        return callback(error);
      }

      myClient = client;
      const queryService = new QueryClientImpl(client);

      return callback(null, queryService);
    });
  }
};

export const queryLiquidityPairs = async (callback: any) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);

  getQueryService((error: any, queryService: any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pairs({
        appId: Long.fromNumber(APP_ID),
        denoms: [],
      })
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryUserOrders = async (
  pairId: any,
  address: any,
  callback: any
) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
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
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryOrder = async (orderId: any, pairId: any, callback: any) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
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
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryPoolsList = async (
  offset: any,
  limit: any,
  countTotal: any,
  reverse: any,
  callback: any
) => {
  const comdex = await envConfigResult();
  
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  
  getQueryService((error: any, queryService: any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pools({
        appId: Long.fromNumber(APP_ID),
        pairId: Long.fromNumber(0),
        disabled: 'false',
      })
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => {
        callback(error?.message);
      });
  });
};

export const queryLiquidityPair = async (pairId: any, callback: any) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pair({
        appId: Long.fromNumber(APP_ID),
        pairId,
      })
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryLiquidityParams = async (callback: any) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .GenericParams({
        appId: Long.fromNumber(APP_ID),
      })
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryPoolSoftLocks = async (
  farmer: any,
  poolId: any,
  callback: any
) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
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
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryPoolCoinDeserialize = async (
  poolId: any,
  poolTokens: any,
  callback: any
) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
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
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryPoolIncentives = async (callback: any) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .PoolIncentives({
        appId: Long.fromNumber(APP_ID),
      })
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => callback(error?.message));
  });
};

export const queryPool = async (id: any, callback: any) => {
  const comdex = await envConfigResult();
  const app: any = process.env.NEXT_PUBLIC_APP_APP;
  const APP_ID = Number(comdex?.envConfig?.[app]?.appId);
  getQueryService((error: any, queryService: any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pool({
        appId: Long.fromNumber(APP_ID),
        poolId: Long.fromNumber(id),
      })
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => {
        callback(error?.message);
      });
  });
};

export const fetchRestAPRs = async (callback: any) => {
  const comdex = await envConfigResult();
  const API_URL = comdex?.envConfig?.apiUrl;
  axios
    .get(`${API_URL}/api/v2/cswap/aprs`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchAllTokens = async (callback: any) => {
  const comdex = await envConfigResult();
  const API_URL = comdex?.envConfig?.apiUrl;
  axios
    .get(`${API_URL}/api/v2/cswap/tokens/all`)
    .then((result) => {      
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchExchangeRateValue = async (
  appId: any,
  pairId: any,
  callback: any
) => {
  const comdex = await envConfigResult();

  axios
    .get(
      `${comdex?.envConfig?.rest}/comdex/liquidity/v1beta1/order_books/${appId}?pair_ids=${pairId}&num_ticks=1`
    )
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};
