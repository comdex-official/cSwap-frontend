import { useState } from "react"
// import { useAppSelector } from "@/shared/hooks/useAppSelector"
import { Icon } from "../../shared/image/Icon"
import dynamic from "next/dynamic"
import { FarmCustomData } from "./Data"
import styles from "./Farm.module.scss"
import Tab from "../../shared/components/tab/Tab"
import Search from "../../shared/components/search/Search"
import FarmTable from "./FarmTable"
import FarmCard from "./FarmCard"
import { useSelector } from "react-redux"

// const Tab = dynamic(() => import("@/shared/components/tab/Tab"))
// const Search = dynamic(() => import("@/shared/components/search/Search"))
// const FarmCard = dynamic(() => import("@/modules/farm/FarmCard"))
// const FarmTable = dynamic(() => import("@/modules/farm/FarmTable"))

const Farm = () => {
  const theme = 'dark';
  const TabData = ["All", "Basic", "Ranged", "My Pools"]

  const [active, setActive] = useState("All")
  const [listView, setListView] = useState(false)

  const handleActive = item => {
    setActive(item)
  }

  return (
    <div
      className={`${styles.farm__wrap} ${theme === "dark" ? styles.dark : styles.light
        }`}
    >
      <div
        className={`${styles.farm__main} ${theme === "dark" ? styles.dark : styles.light
          }`}
      >
        <div
          className={`${styles.farm__header} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.farm__header__body__left} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farm__header__left__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"cSwap v2 Live"}
            </div>
            <div
              className={`${styles.farm__header__left__description} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"Supercharge Your LP Earnings with boosted rewards on cSwap."}
            </div>
            <div
              className={`${styles.farm__header__left__more} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"learn more"}
            </div>
          </div>
          <div
            className={`${styles.farm__header__body__right} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farm__header__right__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"How it works?"}
            </div>
            <div
              className={`${styles.farm__header__right__main} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farm__header__right__body} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farm__header__right__body__background} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.farm__header__right__body__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"STEP 1"}
                  </div>
                  <div
                    className={`${styles.farm__header__right__body__description
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"Provide liquidity in the Master pool"}
                  </div>
                  <div
                    className={`${styles.farm__header__right__body__button} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"Go to Pool"}
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farm__header__right__body} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farm__header__right__body__background} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.farm__header__right__body__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    {"STEP 2"}
                  </div>
                  <div
                    className={`${styles.farm__header__right__body__description
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {`Deposit Equal value of assets in Child Pool 
                    or pools as your Master Pool to 
                    earn boosted rewards`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${styles.farm__body} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.farm__body__left} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farm__body__tab__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <Tab data={TabData} active={active} handleActive={handleActive} />
            </div>
            <div
              className={`${styles.farm__body__line} ${theme === "dark" ? styles.dark : styles.light
                }`}
            />
            <div
              className={`${styles.farm__body__icon__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <Icon
                className={"bi bi-grid-fill"}
                size={"25.05px"}
                onClick={() => setListView(false)}
              />
              <Icon
                className={"bi bi-list-ul"}
                size={"1.9rem"}
                onClick={() => setListView(true)}
              />
            </div>
          </div>
          <div
            className={`${styles.farm__body__right} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farm__body__filter__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <Icon className={"bi bi-funnel-fill"} />
              {"Filter"}
            </div>
            <div
              className={`${styles.farm__body__search__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <Search theme={theme} type={1} placeHolder="Search Pools.." />
            </div>
          </div>
        </div>
        <div
          className={`${styles.farm__footer} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          {listView ? (
            <div
              className={`${styles.farm__table__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <FarmTable theme={theme} />
            </div>
          ) : (
            <div
              className={`${styles.farm__footer__card__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {FarmCustomData.map(item => (
                <FarmCard key={item.id} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Farm
