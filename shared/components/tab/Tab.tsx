import styles from './Tab.module.scss';

interface TabProps {
  data: string[];
  active: any;
  handleActive: (item: string) => void;
  theme?: string;
}

const Tab = ({ data, theme, active, handleActive }: TabProps) => {
  return (
    <div className={styles.tab__wrap}>
      {data.map((item) => (
        <div
          key={item}
          className={`${styles.tab__element} ${
            active === item ? styles.active : ''
          }  ${theme === 'dark' ? styles.dark : styles.light}`}
          onClick={() => handleActive(item)}
        >
          <div
            className={`${styles.tab__title}   ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {item}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tab;
