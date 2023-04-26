import { ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps {
  children: ReactNode;
}

const Card = ({ children }: CardProps) => {
  return (
    <div className={styles.card__wrap}>
      <div className={styles.card__main}>{children}</div>
    </div>
  );
};

export default Card;
