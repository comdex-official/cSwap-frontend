import { Icon } from '@/shared/image/Icon';
import styles from './Search.module.scss';

interface SearchProps {
  theme: string;
  type: number;
  placeHolder?: string;
  onChange: () => void;
  value: string;
}

const Search = ({ placeHolder, type, theme, onChange, value }: SearchProps) => {
  return (
    <div className={styles.search__wrap}>
      <input
        type="text"
        placeholder={placeHolder}
        className={`${type === 1 ? styles.input1 : styles.input2} ${theme === 'dark' ? styles.dark : styles.light
          }`}
        onChange={onChange}
        value={value}
      />
      <Icon
        className={`bi bi-search ${type === 1 ? styles.search__icon1 : styles.search__icon2
          } ${theme === 'dark' ? styles.icon_dark : styles.icon_light}`}
      />
    </div>
  );
};

export default Search;
