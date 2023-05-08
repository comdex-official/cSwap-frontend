import axios from "axios";
import { QueryClientImpl } from "cosmjs-types/cosmos/gov/v1beta1/query";
import Long from "long";
import { comdex } from "../../config/network";
import { createQueryClient } from "../helper";

let myClient:any = null;

const getQueryService = (callback:any) => {
  if (myClient) {
    const queryService = new QueryClientImpl(myClient);

    return callback(null, queryService);
  } else {
    createQueryClient((error:any, client:any) => {
      if (error) {
        return callback(error);
      }

      myClient = client;
      const queryService = new QueryClientImpl(client);

      return callback(null, queryService);
    });
  }
};

export const queryAllProposals = (callback:any) => {
  getQueryService((error:any, queryService:any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Proposals({ proposalStatus: 0, voter: "", depositor: "" })
      .then((result:any) => {
        callback(null, result);
      })
      .catch((error:any) => {
        callback(error?.message);
      });
  });
};

export const queryUserVote = (address:any, proposalId:any, callback:any) => {
  getQueryService((error:any, queryService:any) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Vote({ proposalId: Long.fromNumber(proposalId), voter: address })
      .then((result:any) => {
        callback(null, result);
      })
      .catch((error:any) => {
        callback(error?.message);
      });
  });
};

export const fetchRestProposals = (callback:any) => {
  axios
    .get(`${comdex?.rest}/cosmos/gov/v1beta1/proposals`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchRestProposal = (id:any, callback:any) => {
  axios
    .get(`${comdex?.rest}/cosmos/gov/v1beta1/proposals/${id}`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchRestProposalTally = (id:any, callback:any) => {
  axios
    .get(`${comdex?.rest}/cosmos/gov/v1beta1/proposals/${id}/tally`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchRestProposer = (id:any, callback:any) => {
  axios
    .get(
      `${comdex?.rest}/cosmos/tx/v1beta1/txs?events=submit_proposal.proposal_id=${id}`
    )
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};


