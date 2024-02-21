export const calculateSlippage = (currentPrice, newPrice) => {
  return Math.abs(((currentPrice - newPrice) / currentPrice) * 100);
};

export const calculateRangedPoolPrice = (rx, ry, minPrice, maxPrice) => {
  const sqrt = (x) => Math.sqrt(x);

  const rxDec = parseFloat(rx);
  const ryDec = parseFloat(ry);
  const sqrtM = sqrt(parseFloat(minPrice));
  const sqrtL = sqrt(parseFloat(maxPrice));
  let sqrtP = 0.0;

  if (rxDec === 0) {
    sqrtP = sqrtM;
  } else if (ryDec === 0) {
    sqrtP = sqrtL;
  } else if (rxDec / ryDec === 0) {
    sqrtP = sqrtM;
  } else if (ryDec / rxDec === 0) {
    sqrtP = sqrtL;
  } else {
    const sqrtXOverY = sqrt(rxDec / ryDec);
    const alpha = sqrtM / sqrtXOverY - sqrtXOverY / sqrtL;
    sqrtP = ((alpha + Math.sqrt(alpha ** 2 + 4)) / 2) * sqrtXOverY;
  }

  let sqrtK = 0.0;
  if (sqrtP !== sqrtM) {
    sqrtK = rxDec / (sqrtP - sqrtM);
  }

  let sqrtK2 = 0.0;
  if (sqrtP !== sqrtL) {
    sqrtK2 = ryDec / (1 / sqrtP - 1 / sqrtL);
    if (sqrtK === 0) {
      sqrtK = sqrtK2;
    } else {
      const p = sqrtP ** 2;
      const p1 = (rxDec + sqrtK * sqrtM) / (ryDec + sqrtK / sqrtL);
      const p2 = (rxDec + sqrtK2 * sqrtM) / (ryDec + sqrtK2 / sqrtL);
      if (Math.abs(p - p1) > Math.abs(p - p2)) {
        sqrtK = sqrtK2;
      }
    }
  }

  const transX = sqrtK * sqrtM;
  const transY = sqrtK / sqrtL;
  const price = (rx + transX) / (ry + transY);
  return price;
};

export const getNewRangedPoolRatio = (
  currentRx,
  currentRy,
  direction,
  price,
  amount
) => {
  let newRx,
    newRy,
    final = false;

  if (direction === "buy") {
    newRx = currentRx - price * amount;
    newRy = currentRy + amount;

    if (newRx < 0) {
      newRx = 0;
      final = true;
    }

    return [newRx, newRy, final];
  } else if (direction === "sell") {
    newRx = currentRx + price * amount;
    newRy = currentRy - amount;

    if (newRy < 0) {
      newRy = 0;
      final = true;
    }

    return [newRx, newRy, final];
  }
};
