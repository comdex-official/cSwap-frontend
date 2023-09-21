import { LedgerSigner } from '@cosmjs/ledger-amino';
import {
  AminoTypes,
  createProtobufRpcClient,
  GasPrice,
  QueryClient,
  SigningStargateClient,
} from '@cosmjs/stargate';
// import { SigningStargateClient } from '@cosmjs/cosmwasm-stargate';
import { HttpBatchClient, Tendermint34Client } from '@cosmjs/tendermint-rpc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { comdex } from '../config/network';
import { makeHdPath } from '../utils/string';
import { customAminoTypes } from './aminoConverter';
import { strideAccountParser } from './parser';
import { myRegistry } from './registry';
// import { CosmjsOfflineSigner } from '@leapwallet/cosmos-snap-provider';
import { CosmjsOfflineSigner, cosmjsOfflineSigner } from '@leapwallet/cosmos-snap-provider';
import { cosmos, codec } from '@cosmjs/launchpad';

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
  let walletType = localStorage.getItem('loginType');

  walletType === 'keplr'
    ? await window.keplr.enable(chainID)
    : await window.leap.enable(chainID);

  const offlineSigner =
    walletType === 'keplr'
      ? await window.getOfflineSignerAuto(chainID)
      : await window?.leap?.getOfflineSignerAuto(chainID);

  const accounts = await offlineSigner.getAccounts();

  return [offlineSigner, accounts];
};

export const signAndBroadcastTransaction = (transaction, address, callback) => {
  if (localStorage.getItem('loginType') === 'ledger') {
    return TransactionWithLedger(transaction, address, callback);
  }

  return TransactionWithKeplr(transaction, address, callback);
};

export const TransactionWithKeplr = async (transaction, address, callback) => {
  if (localStorage.getItem('loginType') === 'metamask') {
    const offlineSigner = new CosmjsOfflineSigner(comdex?.chainId);
    const accounts = await offlineSigner.getAccounts();


    if (address !== accounts[0].address) {
      const error = 'Connected account is not active in Keplr';
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

  } else {
    const [offlineSigner, accounts] = await KeplrWallet(comdex.chainId);
    if (address !== accounts[0].address) {
      const error = 'Connected account is not active in Keplr';
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
  }

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
    const error = 'Connected account is not active in Keplr';
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

async function Transaction(wallet, signerAddress, msgs, fee, memo = '') {
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

export const aminoSignIBCTx = (config, transaction, sourceAddress = "", callback) => {
  (async () => {
    let walletType = localStorage.getItem('loginType');

    if (walletType === "metamask") {
      console.log("in Metamask ");
      const offlineSigner = new CosmjsOfflineSigner(config.chainId);
      // const offlineSigner1 = getOfflineSigner(comdex?.chainId);
      // const offlineSigner = window.getOfflineSignerOnlyAmino &&
      //   window.getOfflineSignerOnlyAmino(config.chainId)
      // // const offlineSigner = window?.leap?.getOfflineSignerOnlyAmino &&
      // //   window?.leap?.getOfflineSignerOnlyAmino(config.chainId);
      // // const offlineSigner = new OfflineAminoSigner(comdex?.chainId);
      // const accounts = await offlineSigner.getAccounts();
      // console.log(transaction, "transaction");
      console.log(offlineSigner, "offlineSigner");
      // console.log(offlineSigner1, "offlineSigner1");

      const ibcMessage = {
        type: transaction?.msg?.typeUrl,
        value: {
          sender: transaction?.msg?.value?.sender,
          receiver: transaction?.msg?.value?.receiver,
          token: transaction?.msg?.value?.token,
          // port_id: 'source-port-id',
          channel_id: transaction?.msg?.value?.source_channel,
          timeout_timestamp: transaction?.msg?.value?.timeout_height,
          packet: {
            // sequence: packetSequence,
            source_port: transaction?.msg?.value?.source_port,
            source_channel: transaction?.msg?.value?.source_channel,
            // destination_port: 'destination-port-id',
            // destination_channel: 'destination-channel-id',
            // data: ibcData, // Your IBC data payload
          },
        },
      };


      // SigningStargateClient.connectWithSigner(comdex.rpc, offlineSigner, {
      //   registry: myRegistry,
      //   aminoTypes: aminoTypes,
      //   preferNoSetFee: true,
      // })
      //   .then((client) => {
      //     client
      //       .sign(
      //         address,
      //         [transaction.message],
      //         transaction.fee,
      //         transaction.memo
      //       )
      //       .then((result) => {
      //         callback(null, result);
      //       })
      //       .catch((error) => {
      //         callback(error?.message);
      //       });

      //   })
      //   .catch((error) => {
      //     callback(error && error.message);
      //   });
      const client = await SigningStargateClient.connectWithSigner(
        config.rpc,
        offlineSigner,
        {
          accountParser: strideAccountParser,
          preferNoSetFee: true,
        }
      );
      console.log(client, "client");

      client
        .sendIbcTokens(
          transaction?.msg?.value?.sender,
          transaction?.msg?.value?.receiver,
          transaction?.msg?.value?.token,
          transaction?.msg?.value?.source_port,
          transaction?.msg?.value?.source_channel,
          transaction?.msg?.value?.timeout_height,
          transaction?.msg?.value?.timeout_timestamp,
          transaction?.fee,
          transaction?.memo
        )
        .then((result) => {
          console.log(result, "result");
          if (result?.code !== undefined && result.code !== 0) {
            callback(result.log || result.rawLog);
          } else {
            callback(null, result);
          }
        })
        .catch((error) => {
          console.log(error, "error");
          callback(error?.message);
        });

      // const chainId = config.chainId; // Replace with your chain ID
      // const offlineSigner = new CosmjsOfflineSigner(chainId);
      // // const offlineSigner = window?.leapSnap?.getOfflineSignerOnlyAmino &&
      // //   window?.leapSnap?.getOfflineSignerOnlyAmino(config.chainId);
      // const rpcUrl = config.rpc;
      // console.log(offlineSigner, "offlineSigner");
      // const accounts = await offlineSigner.getAccounts();
      // console.log(transaction, "transaction");
      // const stargateClient = await SigningStargateClient.connectWithSigner(
      //   rpcUrl,
      //   offlineSigner,
      //   {
      //     // gasPrice: GasPrice.fromString("0.0025ujuno"),
      //     accountParser: strideAccountParser,
      //     preferNoSetFee: true,
      //   }
      // );

      // stargateClient
      //   .sendIbcTokens(
      //     transaction?.msg?.value?.sender,
      //     // accounts[0].address,
      //     transaction?.msg?.value?.receiver,
      //     transaction?.msg?.value?.token,
      //     transaction?.msg?.value?.source_port,
      //     transaction?.msg?.value?.source_channel,
      //     transaction?.msg?.value?.timeout_height,
      //     transaction?.msg?.value?.timeout_timestamp,
      //     transaction?.fee,
      //     transaction?.memo
      //   )
      //   .then((result) => {
      //     if (result?.code !== undefined && result.code !== 0) {
      //       callback(result.log || result.rawLog);
      //     } else {
      //       callback(null, result);
      //     }
      //   })
      //   .catch((error) => {
      //     callback(error?.message);
      //   });

      // sign and broadcase 
      // const offlineSigner = new CosmjsOfflineSigner(comdex?.chainId);
      // const accounts = await offlineSigner.getAccounts();
      // console.log(accounts, "accounts");

      // if (address !== accounts[0].address) {
      //   const error = 'Connected account is not active in Keplr';
      //   callback(error);
      //   return;
      // }

      // console.log(offlineSigner, "offlineSigner");
      // console.log(transaction, "transaction");

      // SigningStargateClient.connectWithSigner(comdex.rpc, offlineSigner, {
      //   registry: myRegistry,
      //   aminoTypes: aminoTypes,
      // })
      //   .then((client) => {
      //     client
      //       .signAndBroadcast(
      //         transaction?.msg?.value?.sender,
      //         [transaction.message],
      //         transaction.fee,
      //         transaction.memo
      //       )
      //       .then((result) => {
      //         console.log(result, "result");
      //         callback(null, result);
      //       })
      //       .catch((error) => {
      //         console.log(error, "error");
      //         callback(error?.message);
      //       });
      //   })
      //   .catch((error) => {
      //     console.log(error, "error 2");
      //     callback(error && error.message);
      //   });

      // const offlineSigner = new CosmjsOfflineSigner(config.chainId);
      // const rpcUrl = config.rpc; // Replace with your RPC URL
      // const stargateClient = await SigningStargateClient.connectWithSigner(rpcUrl, offlineSigner, {
      //   gasPrice: GasPrice.fromString('0.0025ucmdx'), // Adjust gas price as needed
      // });

      // const ibcTransaction = {
      //   type: transaction?.msg?.typeUrl,
      //   value: {
      //     sender: transaction?.msg?.value?.sender,
      //     receiver: transaction?.msg?.value?.receiver,
      //     token: transaction?.msg?.value?.token,
      //     // port_id: 'source-port-id',
      //     channel_id: transaction?.msg?.value?.source_channel,
      //     timeout_timestamp: transaction?.msg?.value?.timeout_height,
      //     packet: {
      //       // sequence: packetSequence,
      //       source_port: transaction?.msg?.value?.source_port,
      //       source_channel: transaction?.msg?.value?.source_channel,

      //       // destination_port: 'destination-port-id',
      //       // destination_channel: 'destination-channel-id',
      //       // data: ibcData, // Your IBC data payload
      //     },
      //     fee: transaction?.fee,
      //     memo: transaction?.memo
      //   },
      // };

      // // Sign the transaction
      // const signedTransaction = await offlineSigner.signIbcTransaction(ibcTransaction);

      // // Broadcast the transaction to the network
      // const broadcastResult = await stargateClient.broadcastTx(signedTransaction);
      // console.log(broadcastResult, "broadcastResult");

      // const chainId = config.chainId;
      // const rpcUrl = config.rpc;

      // const offlineSigner = new CosmjsOfflineSigner(comdex?.chainId);// Replace with your method to get the signer
      // const client = await SigningStargateClient.connectWithSigner(rpcUrl, offlineSigner, {
      //   registry: myRegistry,
      //   aminoTypes: aminoTypes,
      //   gasPrice: GasPrice.fromString('0.0025ucmdx'), // Adjust gas price as needed
      // });

      // const senderAddress = transaction?.msg?.value?.sender;
      // const receiverAddress = transaction?.msg?.value?.receiver;
      // const channel = transaction?.msg?.value?.source_channel;
      // const port = transaction?.msg?.value?.source_port;
      // const amount = transaction?.msg?.value?.token;

      // const ibcTransferMsg = {
      //   typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      //   value: {
      //     from_address: senderAddress,
      //     to_address: receiverAddress,
      //     amount: amount,
      //   },
      // };

      // const ibcMsg = {
      //   channel_id: channel,
      //   // connection_id: 'your-connection-id',
      //   port_id: port,
      //   // order: cosmos.channel.v1.Order.ORDER_ORDERED,
      //   version: '1.0',
      //   timeout_height: transaction?.msg?.value?.timeout_height,
      //   source_port: transaction?.msg?.value?.source_port,
      //   source_channel: transaction?.msg?.value?.source_channel,
      //   channel: transaction?.msg?.value?.source_channel,
      //   sender: senderAddress,
      //   receiver: receiverAddress,
      //   // packet: codec.toBase64(codec.toAscii(JSON.stringify(ibcTransferMsg))),
      //   packet: JSON.stringify(ibcTransferMsg),
      //   // Adjust other fields as needed
      // };

      // const ibcTx = {
      //   typeUrl: '/ibc.core.client.v1.MsgSubmitMisbehaviour',
      //   value: ibcMsg,
      // };

      // const fee = transaction?.fee;

      // const memo = transaction?.memo; // Adjust memo as needed

      // const signedTx = await client.sign(ibcTx, fee, memo);
      // const broadcastResponse = await client.broadcastTx(signedTx);

      // console.log('IBC Transaction Result:', broadcastResponse);

      // Tried sign direect 

      // const cosmJS = await SigningStargateClient.connectWithSigner(
      //   comdex.rpc,
      //   sourceAddress,
      //   { registry: myRegistry, aminoTypes: aminoTypes, preferNoSetFee: true }
      // );

      // const offlineSigner = new CosmjsOfflineSigner(config.chainId);
      // const accounts = await offlineSigner.getAccounts();

      // const { accountNumber, sequence } = await cosmJS.getSequence(transaction?.msg?.value?.receiver);
      // const clientChain = await cosmJS.getChainId();
      // console.log(accountNumber, sequence);
      // const txRaw = await cosmJS?.sign(transaction?.msg?.value?.receiver, [transaction.message], transaction?.fee, transaction?.memo, {
      //   // const txRaw = await offlineSigner.sign(transaction?.msg?.value?.receiver, [transaction.message], transaction?.fee, transaction?.memo, {
      //   accountNumber,
      //   sequence: Number(sequence),
      //   chainId: clientChain,
      // });

      // const txBytes = Uint8Array.from(TxRaw.encode(txRaw).finish());

      // cosmJS
      //   .broadcastTx(Uint8Array.from(TxRaw.encode(txBytes).finish()))
      //   .then((res) => {
      //     console.log(res, "tx res");
      //     if (!res?.code) {
      //       callback(null, res)
      //     }
      //     else {
      //       console.log(res?.rawLog);
      //       callback(res)
      //     }
      //   }).catch((error) => {
      //     console.log(error, "Error");
      //     callback(error)
      //   })


      // const offlineSigner = new CosmjsOfflineSigner(config.chainId);
      // const accounts = await offlineSigner.getAccounts();
      // const rpcUrl = config.rpc;

      // const stargateClient = await SigningStargateClient.connectWithSigner(
      //   rpcUrl,
      //   offlineSigner
      // );

      // const signedTx = await stargateClient.sign([transaction.message], transaction?.fee, transaction?.memo);
      // const broadcastResponse = await stargateClient.broadcastTx(signedTx);
      // console.log(broadcastResponse, "broadcastResponse");

    } else {
      (walletType === 'keplr' ? await window.keplr : await window.leap) &&
        walletType === 'keplr'
        ? window.keplr.enable(config.chainId)
        : window.leap.enable(config.chainId);

      const offlineSigner =
        walletType === 'keplr'
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
          transaction?.msg?.value?.sender,
          transaction?.msg?.value?.receiver,
          transaction?.msg?.value?.token,
          transaction?.msg?.value?.source_port,
          transaction?.msg?.value?.source_channel,
          transaction?.msg?.value?.timeout_height,
          transaction?.msg?.value?.timeout_timestamp,
          transaction?.fee,
          transaction?.memo
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
    }


  })();
};
