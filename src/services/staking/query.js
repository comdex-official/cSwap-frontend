import { QueryClientImpl } from "cosmjs-types/cosmos/staking/v1beta1/query";
import { createQueryClient } from "../helper";

export const queryStakeTokens = (callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
