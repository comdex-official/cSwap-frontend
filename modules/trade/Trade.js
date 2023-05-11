import { useSelector } from 'react-redux';
import styles from './Trade.module.scss';
// import { useAppSelector } from '@/shared/hooks/useAppSelector';
import TradeCard from './TradeCard';


const Trade = () => {
  const theme = useSelector((state) => state.theme.theme);

  return (
    <>
      <div className={styles.trade__wrap}>
        <TradeCard theme={theme} />
      </div>
    </>
  );
};

export default Trade;
