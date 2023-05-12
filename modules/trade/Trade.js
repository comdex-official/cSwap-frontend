import styles from "./Trade.module.scss";
import TradeCard from "./TradeCard";

const Trade = () => {
  return (
    <>
      <div className={styles.trade__wrap}>
        <TradeCard theme={"dark"} />
      </div>
    </>
  );
};

export default Trade;
