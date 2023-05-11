import { combineReducers } from "redux";
import {
  ALL_PROPOSALS_SET,
  PROPOSALS_SET,
  PROPOSAL_SET,
  PROPOSAL_TALLY_SET,
  PROPOSER_SET
} from "../constants/govern";

const allProposals = (state = [], action) => {
  if (action.type === ALL_PROPOSALS_SET) {
    return action.list || [];
  }

  return state;
};

const proposals = (state = [], action) => {
  if (action.type === PROPOSALS_SET) {
    return action.list || [];
  }

  return state;
};

const proposalMap = (state = {}, action) => {
  if (action.type === PROPOSAL_SET) {
    return {
      ...state,
      [action?.value?.proposal_id]: action.value || {},
    };
  }

  return state;
};

const proposalTallyMap = (state = {}, action) => {
  if (action.type === PROPOSAL_TALLY_SET) {
    return {
      ...state,
      [action?.proposalId]: action.value || {},
    };
  }

  return state;
};

const proposerMap = (state = {}, action) => {
  if (action.type === PROPOSER_SET) {
    return {
      ...state,
      [action?.proposalId]: action.value || {},
    };
  }

  return state;
};

export default combineReducers({
  proposals,
  allProposals,
  proposalMap,
  proposerMap,
  proposalTallyMap,
});
