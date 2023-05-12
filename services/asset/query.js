import { QueryClientImpl } from "comdex-codec/build/comdex/asset/v1beta1/query";
import Long from "long";
import { createQueryClient } from "../helper";
import axios from "axios";

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

export const ibcAssets = async () => {
  let url = process.env.NEXT_PUBLIC_ASSET_LIST_URL;
  try {
    const result = await axios.get(url);
    return result?.data;
  } catch (error) {
    return error;
  }
};

export const envConfigResult = async () => {
  let url = process.env.NEXT_PUBLIC_CONFIG_JSON_URL;
  try {
    const result = await axios.get(url);
    return result?.data;
  } catch (error) {
    return error;
  }
};

export const inconsResult = async () => {
  let url = process.env.NEXT_PUBLIC_ICONS_JSON_URL;
  try {
    const result = await axios.get(url);
    return result?.data;
  } catch (error) {
    return error;
  }
};
