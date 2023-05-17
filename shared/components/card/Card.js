import styles from "./Card.module.scss";

const Card = ({ children }) => {
  return (
    <div className={styles.card__wrap}>
      <div className={styles.card__main}>{children}</div>
    </div>
  );
};

export default Card;
