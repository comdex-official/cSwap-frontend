import styles from "./Toggle.module.scss";

const Toggle = ({ handleToggleValue, value }) => {
  return (
    <div className={styles.toggle__wrapper}>
      <input
        id="switch"
        type="checkbox"
        onChange={(e) => handleToggleValue(e)}
        checked={value}
      />
      <label htmlFor="switch" />
    </div>
  );
};

export default Toggle;
