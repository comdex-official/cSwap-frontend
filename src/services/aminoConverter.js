import BigNumber from "bignumber.js";

export const customAminoTypes = {
  "/comdex.liquidity.v1beta1.MsgLimitOrder": {
    aminoType: "comdex/liquidity/MsgLimitOrder",
    toAmino: ({
      orderer,
      pairId,
      appId,
      direction,
      offerCoin,
      demandCoinDenom,
      price,
      amount,
    }) => {
      const _price = `${new BigNumber(price).shiftedBy(-18).toFixed(18)}`;

      return {
        orderer: orderer,
        pair_id: String(pairId),
        app_id: String(appId),
        direction: Number(direction),
        offer_coin: offerCoin,
        demand_coin_denom: demandCoinDenom,
        price: _price,
        amount: amount,
        order_lifespan: "0",
      };
    },
    fromAmino: ({
      orderer,
      pair_id,
      app_id,
      direction,
      offer_coin,
      demand_coin_denom,
      price,
      amount,
    }) => {
      return {
        orderer: orderer,
        pairId: parseInt(pair_id),
        appId: parseInt(app_id),
        direction: direction,
        offerCoin: offer_coin,
        demandCoinDenom: demand_coin_denom,
        price: new BigNumber(price).multipliedBy(10 ** 18).toString(),
        amount: amount,
        orderLifespan: { seconds: 0, nanos: 0 },
      };
    },
  },
  "/comdex.liquidity.v1beta1.MsgDeposit": {
    aminoType: "comdex/liquidity/MsgDeposit",
    toAmino: ({ depositor, depositCoins, poolId, appId }) => {
      return {
        depositor,
        deposit_coins: depositCoins,
        pool_id: String(poolId),
        app_id: String(appId),
      };
    },
    fromAmino: ({ depositor, deposit_coins, pool_id, app_id }) => {
      return {
        depositor,
        depositCoins: deposit_coins,
        poolId: Number(pool_id),
        appId: Number(app_id),
      };
    },
  },

  "/comdex.liquidity.v1beta1.MsgWithdraw": {
    aminoType: "comdex/liquidity/MsgWithdraw",
    toAmino: ({ withdrawer, poolId, poolCoin, appId }) => {
      return {
        withdrawer,
        pool_id: String(poolId),
        app_id: String(appId),
        pool_coin: poolCoin,
      };
    },
    fromAmino: ({ withdrawer, pool_id, pool_coin, app_id }) => {
      return {
        withdrawer,
        poolId: Number(pool_id),
        appId: Number(app_id),
        poolCoin: pool_coin,
      };
    },
  },
  "/comdex.liquidity.v1beta1.MsgCreatePool": {
    aminoType: "comdex/liquidity/MsgCreatePool",
    toAmino: ({ creator, pairId, depositCoins, appId }) => {
      return {
        creator,
        pair_id: String(pairId),
        app_id: String(appId),
        deposit_coins: depositCoins,
      };
    },
    fromAmino: ({ creator, pair_id, deposit_coins, app_id }) => {
      return {
        creator,
        pairId: Number(pair_id),
        appId: Number(app_id),
        depositCoins: deposit_coins,
      };
    },
  },
  "/comdex.liquidity.v1beta1.MsgTokensSoftLock": {
    aminoType: "comdex/liquidity/MsgTokensSoftLock",
    toAmino: ({ depositor, poolId, softLockCoin, appId }) => {
      return {
        depositor,
        pool_id: String(poolId),
        app_id: String(appId),
        soft_lock_coin: softLockCoin,
      };
    },
    fromAmino: ({ depositor, pool_id, soft_lock_coin, app_id }) => {
      return {
        depositor,
        poolId: Number(pool_id),
        appId: Number(app_id),
        softLockCoin: soft_lock_coin,
      };
    },
  },
  "/comdex.liquidity.v1beta1.MsgTokensSoftUnlock": {
    aminoType: "comdex/liquidity/MsgTokensSoftUnlock",
    toAmino: ({ depositor, poolId, softUnlockCoin, appId }) => {
      return {
        depositor,
        pool_id: String(poolId),
        app_id: String(appId),
        soft_unlock_coin: softUnlockCoin,
      };
    },
    fromAmino: ({ depositor, pool_id, soft_unlock_coin, app_id }) => {
      return {
        depositor,
        poolId: Number(pool_id),
        appId: Number(app_id),
        softUnlockCoin: soft_unlock_coin,
      };
    },
  },
};
