import { QueryClientImpl } from "cosmjs-types/cosmos/gov/v1beta1/query";
import { createQueryClient } from "../helper";
import Long from "long";
import { comdex } from "../../config/network";
import axios from "axios";

export const queryAllProposals = (callback) => {
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
  createQueryClient((error, client) => {
    if (error) {
      callback(error);
      return;
    }

    const queryService = new QueryClientImpl(client);

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
