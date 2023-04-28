import { useAppSelector } from '@/shared/hooks/useAppSelector';
import dynamic from 'next/dynamic';
import styles from './Bridge.module.scss';

const BridgeCard = dynamic(() => import('@/modules/bridge/BridgeCard'));

const Bridge = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <div className={styles.bridge__wrap}>
      <BridgeCard theme={theme} />
    </div>
  );
};

export default Bridge;
