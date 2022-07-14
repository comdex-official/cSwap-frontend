import { amountConversion, amountConversionWithComma } from "./coin";
import { marketPrice } from "./number";

export const calculatePoolLiquidity = (poolBalance, markets) => {
  const sum =
    Number(poolBalance && poolBalance[0] && poolBalance[0].amount) *
      marketPrice(markets, poolBalance[0] && poolBalance[0].denom) +
    Number(poolBalance && poolBalance[1] && poolBalance[1].amount) *
      marketPrice(markets, poolBalance[1] && poolBalance[1].denom);

  return sum ? amountConversionWithComma(sum) : 0;
};

export const calculatePoolShare = (item) => {
  const amount = item.amount;

  return amount ? amountConversionWithComma(amount) : 0;
};

export const calculateUserShare = (
  userLiquidity,
  denomAmount,
  poolTokenSupply
) => {
  const userShare =
    (userLiquidity * denomAmount) / Number(poolTokenSupply?.amount);
  return userShare ? amountConversion(userShare) : 0;
};
