import styles from "./Toggle.module.scss"

const Toggle = ({ handleToggleValue }) => {
  return (
    <div className={styles.toggle__wrapper}>
      <input id="switch" type="checkbox" onChange={e => handleToggleValue(e)} />
      <label htmlFor="switch" />
    </div>
  )
}

export default Toggle;
