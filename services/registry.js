import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import {
  MsgCancelOrder,
  MsgCreatePool,
  MsgDeposit,
  MsgFarm,
  MsgLimitOrder,
  MsgUnfarm,
  MsgWithdraw,
  MsgMarketOrder,
} from "comdex-codec/build/comdex/liquidity/v1beta1/tx";

export const myRegistry = new Registry([
  ...defaultRegistryTypes,
  ["/comdex.liquidity.v1beta1.MsgCreatePool", MsgCreatePool],
  ["/comdex.liquidity.v1beta1.MsgDeposit", MsgDeposit],
  ["/comdex.liquidity.v1beta1.MsgWithdraw", MsgWithdraw],
  ["/comdex.liquidity.v1beta1.MsgLimitOrder", MsgLimitOrder],
  ["/comdex.liquidity.v1beta1.MsgMarketOrder", MsgMarketOrder],
  ["/comdex.liquidity.v1beta1.MsgFarm", MsgFarm],
  ["/comdex.liquidity.v1beta1.MsgUnfarm", MsgUnfarm],
  ["/comdex.liquidity.v1beta1.MsgCancelOrder", MsgCancelOrder],
]);
