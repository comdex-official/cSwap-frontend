import styles from "./Bridge.module.scss";
import BridgeCard from "./BridgeCard";

const Bridge = () => {
  const theme = "dark";

  return (
    <div className={styles.bridge__wrap}>
      <BridgeCard theme={theme} />
    </div>
  );
};

export default Bridge;
