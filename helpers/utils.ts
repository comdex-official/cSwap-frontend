export const rangeToPercentage = ({min, max, input}:any) =>
  Number(((input - min) * 100) / (max - min))?.toFixed(0);


  export const getAMP = ({currentPrice, minimumPrice, maximumPrice}:any) => {
    return (
      1 /
      (1 -
        (1 / 2) *
          (Math.sqrt(minimumPrice / currentPrice) +
            Math.sqrt(currentPrice / maximumPrice)))
    );
  };
