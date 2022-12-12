import { QueryClientImpl } from "comdex-codec/build/comdex/asset/v1beta1/query";
import Long from "long";
import { createQueryClient } from "../helper";




let myClient = null;

export const getQueryService = (callback) => {
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

export const queryAssets = (offset, limit, countTotal, reverse, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryAssets({
        pagination: {
          key: "",
          offset: Long.fromNumber(offset),
          limit: Long.fromNumber(limit),
          countTotal: countTotal,
          reverse: reverse,
        },
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};