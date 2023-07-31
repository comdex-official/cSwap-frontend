import styles from './Card.module.scss';

const Card = ({ children, farm, mpool }) => {
  return (
    <div
      className={`${styles.card__wrap} ${
        farm && mpool ? styles.master__card : farm && !mpool ? styles.farm__card : ''
      }`}
    >
      <div className={styles.card__main}>{children}</div>
    </div>
  );
};

export default Card;
