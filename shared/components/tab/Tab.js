import styles from "./Tab.module.scss"

const Tab = ({ data, theme, active, handleActive }) => {
  return (
    <div className={styles.tab__wrap}>
      {data.map(item => (
        <div
          key={item}
          className={`${styles.tab__element} ${active === item ? styles.active : ""
            }  ${theme === "dark" ? styles.dark : styles.light}`}
          onClick={() => handleActive(item)}
        >
          <div
            className={`${styles.tab__title}   ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            {item}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Tab
