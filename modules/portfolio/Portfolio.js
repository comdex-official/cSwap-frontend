import styles from "./Portfolio.module.scss"
import { useState } from "react"
// import { useAppSelector } from "@/shared/hooks/useAppSelector"
import dynamic from "next/dynamic"
import { HighchartsReact } from "highcharts-react-official"
import Highcharts from "highcharts"
import Tab from "../../shared/components/tab/Tab"
import Search from "../../shared/components/search/Search"
import PortfolioTable from "./PortfollioTable"
import { useSelector } from "react-redux"

// const PortfolioTable = dynamic(() =>
//   import("@/modules/portfolio/PortfollioTable")
// )
// const Tab = dynamic(() => import("@/shared/components/tab/Tab"))
// const Search = dynamic(() => import("@/shared/components/search/Search"))

const Portfolio = () => {
  const theme = useSelector(state => state.theme.theme)

  const [active, setActive] = useState("Assets")

  const handleActive = item => {
    setActive(item)
  }

  const TabData = ["Assets", "Liquidity", "History"]

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 220,
      width: 220,
      margin: 5
    },
    credits: {
      enabled: false
    },
    title: {
      text: "137.87 USD",
      verticalAlign: "middle",
      floating: true,
      style: {
        fontSize: "36px",
        fontWeight: "600",
        fontFamily: "Montserrat",
        color: "#FFFFFF"
      }
    },
    subtitle: {
      floating: true,
      style: {
        fontSize: "25px",
        fontWeight: "500",
        fontFamily: "Lexend Deca",
        color: "#fff"
      },
      y: 70
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "100%",
        innerSize: "75%",
        borderWidth: 0,
        className: "highchart_chart",
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50
          }
        }
      }
    },
    series: [
      {
        states: {
          hover: {
            enabled: true
          }
        },
        name: "",
        data: [
          {
            name: "Asset Balance",
            y: 13.52,
            color: "#1E3B6F"
          }
        ]
      }
    ]
  }

  return (
    <div
      className={`${styles.portfolio__wrap} ${theme === "dark" ? styles.dark : styles.light
        }`}
    >
      <div
        className={`${styles.portfolio__main} ${theme === "dark" ? styles.dark : styles.light
          }`}
      >
        <div
          className={`${styles.portfolio__header__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.portfolio__header__element__wrap} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <HighchartsReact highcharts={Highcharts} options={Options} />
            {/* <div
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
            </div> */}
          </div>

          <div
            className={`${styles.portfolio__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"Total Value"}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"137.87 USD"}
            </div>
          </div>
          <div
            className={`${styles.portfolio__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div />
              {"Asset Balance"}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"137.87 USD"}
            </div>
          </div>
          <div
            className={`${styles.portfolio__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.portfolio__element__upper__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div /> {"Farm Balance"}
            </div>
            <div
              className={`${styles.portfolio__element__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"137.87 USD"}
            </div>
          </div>
        </div>
        <div
          className={`${styles.portfolio__body__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.portfolio__tab} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <Tab data={TabData} active={active} handleActive={handleActive} />
          </div>
          <div
            className={`${styles.portfolio__search} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <Search theme={theme} type={1} placeHolder="Search Asset.." />
          </div>
        </div>
        <div
          className={`${styles.portfolio__table} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <PortfolioTable theme={theme} active={active} />
        </div>
      </div>
    </div>
  )
}

export default Portfolio
