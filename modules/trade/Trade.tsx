import dynamic from 'next/dynamic';
import styles from './Trade.module.scss';
import { useAppSelector } from '@/shared/hooks/useAppSelector';

const TradeCard = dynamic(() => import('@/modules/trade/TradeCard'));

const Trade = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <>
      <div className={styles.trade__wrap}>
        <TradeCard theme={theme} />
      </div>
    </>
  );
};

export default Trade;
