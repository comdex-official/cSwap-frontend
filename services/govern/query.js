import axios from "axios";
import { QueryClientImpl } from "cosmjs-types/cosmos/gov/v1beta1/query";
import Long from "long";
import { comdex } from "../../config/network";
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

export const queryAllProposals = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Proposals({ proposalStatus: 0, voter: "", depositor: "" })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};

export const queryUserVote = (address, proposalId, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Vote({ proposalId: Long.fromNumber(proposalId), voter: address })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};

export const fetchRestProposals = (callback) => {
  axios
    .get(`${comdex?.rest}/cosmos/gov/v1beta1/proposals`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchRestProposal = (id, callback) => {
  axios
    .get(`${comdex?.rest}/cosmos/gov/v1beta1/proposals/${id}`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchRestProposalTally = (id, callback) => {
  axios
    .get(`${comdex?.rest}/cosmos/gov/v1beta1/proposals/${id}/tally`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchRestProposer = (id, callback) => {
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
