import { LedgerSigner } from "@cosmjs/ledger-amino";
import {
  AminoTypes,
  createProtobufRpcClient,
  QueryClient,
  SigningStargateClient
} from "@cosmjs/stargate";
import { HttpBatchClient, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { comdex } from "../config/network";
import { makeHdPath } from "../utils/string";
import { customAminoTypes } from "./aminoConverter";
import { strideAccountParser } from "./parser";
import { myRegistry } from "./registry";

const aminoTypes = new AminoTypes(customAminoTypes);

export const createQueryClient = (callback) => {
  return newQueryClientRPC(comdex.rpc, callback);
};

export const newQueryClientRPC = (rpc, callback) => {
  const httpBatch = new HttpBatchClient(rpc, {
    batchSizeLimit: 50,
    dispatchInterval: 500,
  });

  Tendermint34Client.create(httpBatch)
    .then((tendermintClient) => {
      const queryClient = new QueryClient(tendermintClient);
      const rpcClient = createProtobufRpcClient(queryClient);
      callback(null, rpcClient);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const KeplrWallet = async (chainID = comdex.chainId) => {
  let walletType = localStorage.getItem("loginType");

  walletType === "keplr"
    ? await window.keplr.enable(chainID)
    : await window.leap.enable(chainID);

  const offlineSigner =
    walletType === "keplr"
      ? window.getOfflineSigner(chainID)
      : window?.leap?.getOfflineSigner(chainID);
  const accounts = await offlineSigner.getAccounts();
  return [offlineSigner, accounts];
};

export const signAndBroadcastTransaction = (transaction, address, callback) => {
  if (localStorage.getItem("loginType") === "ledger") {
    return TransactionWithLedger(transaction, address, callback);
  }

  return TransactionWithKeplr(transaction, address, callback);
};

export const TransactionWithKeplr = async (transaction, address, callback) => {
  const [offlineSigner, accounts] = await KeplrWallet(comdex.chainId);
  if (address !== accounts[0].address) {
    const error = "Connected account is not active in Keplr";
    callback(error);
    return;
  }

  SigningStargateClient.connectWithSigner(comdex.rpc, offlineSigner, {
    registry: myRegistry,
    aminoTypes: aminoTypes,
    preferNoSetFee: true,
  })
    .then((client) => {
      client
        .signAndBroadcast(
          address,
          [transaction.message],
          transaction.fee,
          transaction.memo
        )
        .then((result) => {
          callback(null, result);
        })
        .catch((error) => {
          callback(error?.message);
        });
    })
    .catch((error) => {
      callback(error && error.message);
    });
};

async function LedgerWallet(hdpath, prefix) {
  const interactiveTimeout = 120_000;

  async function createTransport() {
    const ledgerTransport = await TransportWebUSB.create(
      interactiveTimeout,
      interactiveTimeout
    );
    return ledgerTransport;
  }

  const transport = await createTransport();
  const signer = new LedgerSigner(transport, {
    testModeAllowed: true,
    hdPaths: [hdpath],
    prefix: prefix,
  });
  const [firstAccount] = await signer.getAccounts();
  return [signer, firstAccount.address];
}

export async function TransactionWithLedger(
  transaction,
  userAddress,
  callback
) {
  const [wallet, address] = await LedgerWallet(makeHdPath(), comdex.prefix);
  if (userAddress !== address) {
    const error = "Connected account is not active in Keplr";
    callback(error);
    return;
  }

  const response = Transaction(
    wallet,
    address,
    [transaction?.message],
    transaction?.fee,
    transaction?.memo
  );

  response
    .then((result) => {
      callback(null, result);
    })
    .catch((error) => {
      callback(error && error.message);
    });
}

async function Transaction(wallet, signerAddress, msgs, fee, memo = "") {
  const cosmJS = await SigningStargateClient.connectWithSigner(
    comdex.rpc,
    wallet,
    { registry: myRegistry, aminoTypes: aminoTypes, preferNoSetFee: true }
  );

  const { accountNumber, sequence } = await cosmJS.getSequence(signerAddress);
  const clientChain = await cosmJS.getChainId();

  const txRaw = await cosmJS.sign(signerAddress, msgs, fee, memo, {
    accountNumber,
    sequence: Number(sequence),
    chainId: clientChain,
  });

  const txBytes = Uint8Array.from(TxRaw.encode(txRaw).finish());

  return cosmJS.broadcastTx(txBytes);
}

export const aminoSignIBCTx = (config, transaction, callback) => {
  (async () => {
    let walletType = localStorage.getItem("loginType");

    (walletType === "keplr" ? await window.keplr : await window.wallet) &&
    walletType === "keplr"
      ? window.keplr.enable(config.chainId)
      : window.leap.enable(config.chainId);

    const offlineSigner =
      walletType === "keplr"
        ? window.getOfflineSignerOnlyAmino &&
          window.getOfflineSignerOnlyAmino(config.chainId)
        : window?.leap?.getOfflineSignerOnlyAmino &&
          window?.leap?.getOfflineSignerOnlyAmino(config.chainId);

    const client = await SigningStargateClient.connectWithSigner(
      config.rpc,
      offlineSigner,
      {
        accountParser: strideAccountParser,
        preferNoSetFee: true,
      }
    );

    client
      .sendIbcTokens(
        transaction.msg?.value?.sender,
        transaction.msg?.value?.receiver,
        transaction.msg?.value?.token,
        transaction.msg?.value?.source_port,
        transaction.msg?.value?.source_channel,
        transaction.msg?.value?.timeout_height,
        transaction.msg?.value?.timeout_timestamp,
        transaction.fee,
        transaction.memo
      )
      .then((result) => {
        if (result?.code !== undefined && result.code !== 0) {
          callback(result.log || result.rawLog);
        } else {
          callback(null, result);
        }
      })
      .catch((error) => {
        callback(error?.message);
      });
  })();
};
