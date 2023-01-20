import { HttpBatchClient, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { buildQuery } from "@cosmjs/tendermint-rpc/build/tendermint34/requests";
import { comdex } from "../config/network";
import { DEFAULT_FEE } from "../constants/common";

const httpBatch = new HttpBatchClient(comdex?.rpc, {
  batchSizeLimit: 50,
  dispatchInterval: 500,
});

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

export const abbreviateMessage = (msg) => {
  if (Array.isArray(msg)) {
    const sum = msg
      .map((x) => abbreviateMessage(x))
      .reduce((s, c) => {
        const sh = s;
        if (sh[c]) {
          sh[c] += 1;
        } else {
          sh[c] = 1;
        }
        return sh;
      }, {});
    const output = [];

    Object.keys(sum).forEach((k) => {
      output.push(sum[k] > 1 ? `${k}×${sum[k]}` : k);
    });
    return output.join(", ");
  }

  if (msg["@type"]) {
    return msg["@type"]
      .substring(msg["@type"]?.lastIndexOf(".") + 1)
      .replace("Msg", "");
  }

  if (msg?.typeUrl) {
    return msg?.typeUrl
      .substring(msg?.typeUrl?.lastIndexOf(".") + 1)
      .replace("Msg", "");
  }

  return msg?.type
    ?.substring(msg?.type?.lastIndexOf("/") + 1)
    .replace("Msg", "");
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
  Tendermint34Client.create(httpBatch)
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
  const tmClient = await Tendermint34Client.create(httpBatch);
  const block = await tmClient.block(height);

  return block?.block?.header?.time;
};

export const fetchTxHash = (hash, callback) => {
  Tendermint34Client.create(httpBatch)
    .then((tendermintClient) => {
      tendermintClient
        .tx({ hash })
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
