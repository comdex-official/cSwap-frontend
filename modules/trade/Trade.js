import { useSelector } from "react-redux";
import styles from "./Trade.module.scss";
// import { useAppSelector } from '@/shared/hooks/useAppSelector';
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
