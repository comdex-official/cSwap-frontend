import { useAppSelector } from '@/shared/hooks/useAppSelector';
import styles from './Assets.module.scss';
import dynamic from 'next/dynamic';
import { Icon } from '@/shared/image/Icon';
import { useState } from 'react';

const AssetTable = dynamic(() => import('@/modules/assets/AssetTable'));
const Toggle = dynamic(() => import('@/shared/components/toggle/Toggle'));
const Search = dynamic(() => import('@/shared/components/search/Search'));

const Assets = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  const [toggleValue, setToggleValue] = useState<boolean>(false);

  const handleToggleValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToggleValue(e.target.checked);
  };

  return (
    <div
      className={`${styles.assets__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.assets__main} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.assets__head__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.assets__head__left__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {'Assets'}
          </div>
          <div
            className={`${styles.assets__head__right__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {'Total Asset Balance:  139.6 USD'}
            <Icon className="bi bi-arrow-clockwise" />
          </div>
        </div>

        <div
          className={`${styles.assets__body__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.assets__toggle} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <span>{'Hide 0 Balances'}</span>
            <Toggle handleToggleValue={handleToggleValue} />
          </div>
          <div
            className={`${styles.assets__search} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <Search theme={theme} type={2} placeHolder="Search Asset.." />
          </div>
        </div>

        <div
          className={`${styles.assets__table} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <AssetTable theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default Assets;
