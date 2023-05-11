import { QueryClientImpl } from "cosmjs-types/cosmos/bank/v1beta1/query";
import { createQueryClient, newQueryClientRPC } from "../helper";

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

export const queryAllBalances = (owner, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .AllBalances({
        address: owner,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};

export const queryBalance = (rpc, address, denom, callback) => {
  newQueryClientRPC(rpc, (error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const stakingQueryService = new QueryClientImpl(client);

    stakingQueryService
      .Balance({
        address,
        denom,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};

export const querySupply = (denom, callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const stakingQueryService = new QueryClientImpl(client);

    stakingQueryService
      .SupplyOf({
        denom,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};
