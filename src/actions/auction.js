import {
  AUCTION_LIST_SET,
  BIDDING_LIST_SET,
  BID_AMOUNT_SET,
  CURRENT_AUCTION_SET,
} from "../constants/auction";

export const setAuctions = (list, pagination) => {
  return {
    type: AUCTION_LIST_SET,
    list,
    pagination,
  };
};

export const setBiddings = (list, pagination, bidder) => {
  return {
    type: BIDDING_LIST_SET,
    list,
    pagination,
    bidder,
  };
};

export const setCurrentAuction = (value) => {
  return {
    type: CURRENT_AUCTION_SET,
    value,
  };
};

export const setBidAmount = (value) => {
  return {
    type: BID_AMOUNT_SET,
    value,
  };
};
