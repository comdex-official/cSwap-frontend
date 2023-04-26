import styles from './Toggle.module.scss';

type ToggleProps = {
  handleToggleValue: (value: React.ChangeEvent<HTMLInputElement>) => void;
};

const Toggle = ({ handleToggleValue }: ToggleProps) => {
  return (
    <div className={styles.toggle__wrapper}>
      <input
        id="switch"
        type="checkbox"
        onChange={(e) => handleToggleValue(e)}
      />
      <label htmlFor="switch" />
    </div>
  );
};

export default Toggle;
