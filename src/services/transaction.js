import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { buildQuery } from "@cosmjs/tendermint-rpc/build/tendermint34/requests";
import { comdex } from "../config/network";

import { DEFAULT_FEE } from "../constants/common";

export const getTypeURL = (key) => {
  switch (key) {
    case "create":
      return "/comdex.vault.v1beta1.MsgCreateRequest";
    case "deposit":
      return "/comdex.vault.v1beta1.MsgDepositRequest";
    case "withdraw":
      return "/comdex.vault.v1beta1.MsgWithdrawRequest";
    case "draw":
      return "/comdex.vault.v1beta1.MsgDrawRequest";
    case "repay":
      return "/comdex.vault.v1beta1.MsgRepayRequest";
    default:
      return "";
  }
};

export const messageTypeToText = (type) => {
  switch (type) {
    case "/cosmos.bank.v1beta1.MsgSend":
      return "Send";
    case "/comdex.vault.v1beta1.MsgCreateRequest":
      return "CreateVault";
    case "/comdex.vault.v1beta1.MsgDepositRequest":
      return "VaultDepositCollateral";
    case "/comdex.vault.v1beta1.MsgWithdrawRequest":
      return "VaultWithdrawCollateral";
    case "/comdex.vault.v1beta1.MsgDrawRequest":
      return "VaultDrawDebt";
    case "/comdex.vault.v1beta1.MsgRepayRequest":
      return "VaultRepayDebt";
    case "/comdex.vault.v1beta1.MsgCloseRequest":
      return "CloseVault";
    case "/comdex.liquidity.v1beta1.MsgDeposit":
      return "PoolDeposit";
    case "/comdex.liquidity.v1beta1.MsgWithdraw":
      return "PoolWithdraw";
    case "/comdex.liquidity.v1beta1.MsgSwapWithinBatch":
      return "PoolSwap";
    case "/ibc.applications.transfer.v1.MsgTransfer":
      return "IBC-Transfer";
    case "/comdex.auction.v1beta1.MsgPlaceBidRequest":
      return "PlaceBid";
    case "/comdex.liquidity.v1beta1.MsgTokensSoftUnlock":
      return "Unfarm";
    case "/comdex.liquidity.v1beta1.MsgTokensSoftLock":
      return "Farm";
    case "/comdex.liquidity.v1beta1.MsgLimitOrder":
      return "LimitOrder";
    case "/comdex.liquidity.v1beta1.MsgUnbondPoolTokens":
      return "UnbondPoolTokens";
    case "/comdex.liquidity.v1beta1.MsgBondPoolTokens":
      return "MsgBondPoolTokens";
    case "/comdex.liquidity.v1beta1.MsgDepositWithinBatch":
      return "PoolDeposit";
    case "/comdex.liquidity.v1beta1.MsgWithdrawWithinBatch":
      return "PoolWithdraw";
    case "/comdex.locker.v1beta1.MsgWithdrawAssetRequest":
      return "WithdrawAsset";
    case "/comdex.locker.v1beta1.MsgCreateLockerRequest":
      return "CreateLocker";
    case "/comdex.locker.v1beta1.MsgDepositAssetRequest":
      return "DepositAssetRequest";
    case "/comdex.lend.v1beta1.MsgLend":
      return "Lend";
    case "/comdex.lend.v1beta1.MsgCloseLend":
      return "Close";
    case "/comdex.lend.v1beta1.MsgWithdraw":
      return "Withdraw";
    case "/comdex.lend.v1beta1.MsgDeposit":
      return "Deposit";
    case "/comdex.lend.v1beta1.MsgBorrow":
      return "Borrow";
    case "/comdex.lend.v1beta1.MsgRepay":
      return "Repay";
    case "/comdex.lend.v1beta1.MsgDepositBorrow":
      return "DepositBorrow";
    case "/comdex.lend.v1beta1.MsgDraw":
      return "Draw";
    case "/comdex.lend.v1beta1.MsgCloseBorrow":
      return "CloseBorrow";
    case "/cosmos.gov.v1beta1.MsgVote":
      return "Vote";
    default:
      return type;
  }
};

export const defaultFee = () => {
  return {
    amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
    gas: "500000",
  };
};

const txSearchParams = (recipientAddress, pageNumber, pageSize, type) => {
  return {
    query: buildQuery({
      tags: [{ key: type, value: recipientAddress }],
    }),
    page: pageNumber,
    per_page: pageSize,
    prove: false,
    order_by: "desc",
  };
};

export const fetchTxHistory = (address, pageNumber, pageSize, callback) => {
  Tendermint34Client.connect(comdex.rpc)
    .then((tendermintClient) => {
      tendermintClient
        .txSearch(
          txSearchParams(address, pageNumber, pageSize, "message.sender")
        )
        .then((res) => {
          callback(null, res);
        })
        .catch((error) => {
          callback(error && error.message);
        });
    })
    .catch((error) => {
      callback(error && error.message);
    });
};

export const getTransactionTimeFromHeight = async (height) => {
  const tmClient = await Tendermint34Client.connect(comdex?.rpc);
  const block = await tmClient.block(height);

  return block?.block?.header?.time;
};
