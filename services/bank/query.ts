import { QueryClientImpl } from 'cosmjs-types/cosmos/bank/v1beta1/query';
import { createQueryClient, newQueryClientRPC } from '../helper';

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

export const queryAllBalances = async (owner: any, callback: any) => {
  getQueryService((error: any, queryService: any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .AllBalances({
        address: owner,
      })
      .then((result: any) => {
        console.log('SSSS', result);
        callback(null, result);
      })
      .catch((error: any) => {
        callback(error?.message);
      });
  });
};

export const queryBalance = (
  rpc: string,
  address: any,
  denom: string,
  callback: (error: any, result?: any) => void
) => {
  newQueryClientRPC(rpc, (error: any, client: any) => {
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
      .then((result: any) => {
        callback(null, result);
      })
      .catch((error: any) => {
        callback(error?.message);
      });
  });
};

export const querySupply = (denom: any, callback: any) => {
  createQueryClient((error: any, client: any) => {
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
