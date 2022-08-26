import { QueryClientImpl } from "cosmjs-types/cosmos/staking/v1beta1/query";
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

export const queryStakeTokens = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pool({})
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};
