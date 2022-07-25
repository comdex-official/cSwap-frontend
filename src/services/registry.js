import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import {
  MsgCreatePool,
  MsgDeposit,
  MsgLimitOrder,
  MsgTokensSoftLock,
  MsgTokensSoftUnlock,
  MsgWithdraw
} from "comdex-codec/build/comdex/liquidity/v1beta1/tx";

export const myRegistry = new Registry([
  ...defaultRegistryTypes,
  ["/comdex.liquidity.v1beta1.MsgCreatePool", MsgCreatePool],
  ["/comdex.liquidity.v1beta1.MsgDeposit", MsgDeposit],
  ["/comdex.liquidity.v1beta1.MsgWithdraw", MsgWithdraw],
  ["/comdex.liquidity.v1beta1.MsgLimitOrder", MsgLimitOrder],
  ["/comdex.liquidity.v1beta1.MsgTokensSoftLock", MsgTokensSoftLock],
  ["/comdex.liquidity.v1beta1.MsgTokensSoftUnlock", MsgTokensSoftUnlock],
]);
