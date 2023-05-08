import moment from "moment";
import AssetList from "../Config/ibc_assets.json";
import React from "react";

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_FEE = 20000;
export const DOLLAR_DECIMALS = 2;
export const MAX_SLIPPAGE_TOLERANCE = 3;
export const PRICE_DECIMALS = 4;

export const proposalOptionMap:any = {
  1: "Yes",
  2: "Abstain",
  3: "No",
  4: "No With Veto",
};

export const rangeToPercentage = ({min, max, input}:any) =>
  Number(((input - min) * 100) / (max - min))?.toFixed(0);


  export const getAMP = ({currentPrice, minimumPrice, maximumPrice}:any) => {
    return (
      1 /
      (1 -
        (1 / 2) *
          (Math.sqrt(minimumPrice / currentPrice) +
            Math.sqrt(currentPrice / maximumPrice)))
    );
  };


  export const formatTime = (time:any) => {
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
  };

  export const proposalStatusMap:any = {
    PROPOSAL_STATUS_UNSPECIFIED: "Nil",
    PROPOSAL_STATUS_DEPOSIT_PERIOD: "Deposit Period",
    PROPOSAL_STATUS_VOTING_PERIOD: "Voting Period",
    PROPOSAL_STATUS_PASSED: "Passed",
    PROPOSAL_STATUS_REJECTED: "Rejected",
    PROPOSAL_STATUS_FAILED: "Failed",
  };
  

  export const formatNumber = (number: number) => {
    if (number >= 1000 && number < 1000000) {
      return (number / 1000).toFixed(DOLLAR_DECIMALS) + "K";
    } else if (number >= 1000000) {
      return (number / 1000000).toFixed(DOLLAR_DECIMALS) + "M";
    } else if (number < 1000) {
      return number;
    }
  };

  export const truncateString = (string:any, front:any, back:any) => {
    if (typeof string === "string") {
      return `${string?.substr(0, front)}...${string?.substr(
        string?.length - back,
        string?.length
      )}`;
    }
  };
  
  export const stringTagParser = (input:any) => {
    const lines = input.split("\n");
    const output:any = [];
    lines.forEach((d:any, i:any) => {
      if (i > 0) {
        output.push(React.createElement('br'));
      }
      output.push(d);
    });
    return output;
  };

  const getDenomToDisplaySymbolMap = () => {
    let myMap:any = {};
  
    for (let i = 0; i < AssetList?.tokens?.length; i++) {
      if (myMap[AssetList?.tokens[i].ibcDenomHash] === undefined) {
        myMap[AssetList?.tokens[i].ibcDenomHash] = AssetList?.tokens[i]?.symbol;
      }
    }
  
    return myMap;
  };

  let denomToDisplaySymbol = getDenomToDisplaySymbolMap();

  export const lowercaseFirstLetter = (string:any) => {
    return string.charAt(0).toLowerCase() + string.slice(1).toUpperCase();
  };

  export const denomConversion = (denom:any) => {
    // Remove: below if for local testing
    if (denom === "weth-wei") {
      return "WETH";
    }
  
    if (denomToDisplaySymbol[denom]) {
      return denomToDisplaySymbol[denom];
    }
  
    if (denom && denom.substr(0, 1) === "u") {
      if (
        denom &&
        denom.substr(0, 2) === "uc" &&
        !(denom.substr(0, 3) === "ucm")
      ) {
        return (
          denom.substr(1, denom.length) &&
          lowercaseFirstLetter(denom.substr(1, denom.length))
        );
      }
      return (
        denom.substr(1, denom.length) &&
        denom.substr(1, denom.length).toUpperCase()
      );
    }
  };
