import styles from './Portfolio.module.scss';
import { useState } from 'react';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import dynamic from 'next/dynamic';

const PortfolioTable = dynamic(
  () => import('@/modules/portfolio/PortfollioTable')
);
const Tab = dynamic(() => import('@/shared/components/tab/Tab'));
const Search = dynamic(() => import('@/shared/components/search/Search'));

const Portfolio = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  const [active, setActive] = useState('Assets');

  const handleActive = (item: string) => {
    setActive(item);
  };

  const TabData = ['Assets', 'Liquidity', 'History'];

  return (
    <div
      className={`${styles.portfolio__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.portfolio__main} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.portfolio__header__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.portfolio__element__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'137.87 USD'}
            </div>
          </div>
          <div
            className={`${styles.portfolio__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Total Value'}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'137.87 USD'}
            </div>
          </div>
          <div
            className={`${styles.portfolio__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div />
              {'Asset Balance'}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'137.87 USD'}
            </div>
          </div>
          <div
            className={`${styles.portfolio__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div /> {'Farm Balance'}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'137.87 USD'}
            </div>
          </div>
        </div>
        <div
          className={`${styles.portfolio__body__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.portfolio__tab} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <Tab data={TabData} active={active} handleActive={handleActive} />
          </div>
          <div
            className={`${styles.portfolio__search} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <Search theme={theme} type={1} placeHolder="Search Asset.." />
          </div>
        </div>
        <div
          className={`${styles.portfolio__table} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <PortfolioTable theme={theme} active={active} />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
