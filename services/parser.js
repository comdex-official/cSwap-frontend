import { Uint64 } from "@cosmjs/math";
import { decodePubkey } from "@cosmjs/proto-signing";
import { assert } from "@cosmjs/utils";
import {
  BaseAccount,
  ModuleAccount
} from "cosmjs-types/cosmos/auth/v1beta1/auth";
import {
  BaseVestingAccount,
  ContinuousVestingAccount,
  DelayedVestingAccount,
  PeriodicVestingAccount
} from "cosmjs-types/cosmos/vesting/v1beta1/vesting";
import { stride } from "stridejs/module/codegen";

const uint64FromProto = (input) => {
  return Uint64.fromString(input.toString());
};

const accountFromBaseAccount = (input) => {
  const { address, pubKey, accountNumber, sequence } = input;
  const pubkey = decodePubkey(pubKey);
  return {
    address: address,
    pubkey: pubkey,
    accountNumber: uint64FromProto(accountNumber).toNumber(),
    sequence: uint64FromProto(sequence).toNumber(),
  };
};

export const strideAccountParser = (input) => {
  const { typeUrl, value } = input;
  switch (typeUrl) {
    // auth
    case "/cosmos.auth.v1beta1.BaseAccount":
      return accountFromBaseAccount(BaseAccount.decode(value));
    case "/stride.vesting.StridePeriodicVestingAccount": {
      const baseAccount =
        stride.vesting.StridePeriodicVestingAccount.decode(value)
          .baseVestingAccount.baseAccount;
      return accountFromBaseAccount(baseAccount);
    }
    case "/cosmos.auth.v1beta1.ModuleAccount": {
      const baseAccount = ModuleAccount.decode(value).baseAccount;
      return accountFromBaseAccount(baseAccount);
    }

    // vesting

    case "/cosmos.vesting.v1beta1.BaseVestingAccount": {
      const baseAccount = BaseVestingAccount.decode(value)?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }
    case "/cosmos.vesting.v1beta1.ContinuousVestingAccount": {
      const baseAccount =
        ContinuousVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }
    case "/cosmos.vesting.v1beta1.DelayedVestingAccount": {
      const baseAccount =
        DelayedVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }
    case "/cosmos.vesting.v1beta1.PeriodicVestingAccount": {
      const baseAccount =
        PeriodicVestingAccount.decode(value)?.baseVestingAccount?.baseAccount;
      assert(baseAccount);
      return accountFromBaseAccount(baseAccount);
    }

    default:
      throw new Error(`Unsupported type: '${typeUrl}'`);
  }
};
