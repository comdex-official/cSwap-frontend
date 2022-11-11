import { ALL_PROPOSALS_SET, PROPOSALS_SET, PROPOSAL_SET, PROPOSER_SET } from "../constants/govern";

export const setAllProposals = (list) => {
  return {
    type: ALL_PROPOSALS_SET,
    list,
  };
};

export const setProposals = (list) => {
    return {
      type: PROPOSALS_SET,
      list,
    };
  };

  export const setProposal = (value) => {
    return {
      type: PROPOSAL_SET,
      value,
    };
  };

  export const setProposer = (value, proposalId) => {
    return {
      type: PROPOSER_SET,
      proposalId,
      value,
    };
  };