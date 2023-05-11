import dynamic from "next/dynamic"
import styles from "../assets/Assets.module.scss"
import styles1 from "../portfolio/Portfolio.module.scss"
import { NextImage } from "../../shared/image/NextImage"
import { ATOM, ArrowRight, CMDS } from "../../shared/image"
import Table from '../../shared/components/table/Table'

// const Table = dynamic(() => import("@/shared/components/table/Table"))

const PortfolioTable = ({ theme, active }) => {
  const COLUMNS = [
    {
      Header: "Asset",
      accessor: "Asset",
      Cell: ({ row, value }) => (
        <div
          className={`${styles.assets__table__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.assets__logo__wrap} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.assets__logo} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <NextImage src={row?.original?.Image} alt="Image" />
            </div>
          </div>
          <div
            className={`${styles.assets__title} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            {value}
          </div>
        </div>
      )
    },
    {
      Header: "No. of Tokens",
      accessor: "Tokens",
      Cell: ({ value }) => (
        <div
          className={`${styles.all__title__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          {value}
        </div>
      )
    },
    {
      Header: "Price",
      accessor: "Price",
      Cell: ({ value }) => (
        <div
          className={`${styles.all__title__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          ${value}
        </div>
      )
    },
    {
      Header: "Amount",
      accessor: "Amount",
      Cell: ({ value }) => (
        <div
          className={`${styles.all__title__wrap} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          ${value}
        </div>
      )
    },
    {
      Header: "IBC Deposit",
      accessor: "IBCDeposit",
      Cell: ({ value }) => (
        <>
          {value ? (
            <div
              className={`${styles.ibc__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.ibc__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"Deposit"}
              </div>
              <NextImage src={ArrowRight} alt="Arrow" />
            </div>
          ) : null}
        </>
      )
    },
    {
      Header: "IBC Withdraw",
      accessor: "IBCWithdraw",
      Cell: ({ value }) => (
        <>
          {value ? (
            <div
              className={`${styles.ibc__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.ibc__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"Withdraw"}
              </div>
              <NextImage src={ArrowRight} alt="Arrow" />
            </div>
          ) : null}
        </>
      )
    }
  ]

  const DATA = [
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false
    },
    {
      Asset: "CMDX",
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false
    }
  ]

  const LiquidityCOLUMNS = [
    {
      Header: "Asset Pair",
      accessor: "Asset",
      Cell: ({ row, value }) => (
        <div
          className={`${styles1.portfolio__table__asset} ${theme === "dark" ? styles1.dark : styles1.light
            }`}
        >
          <div
            className={`${styles1.farmCard__element__left__logo__wrap} ${theme === "dark" ? styles1.dark : styles1.light
              }`}
          >
            <div
              className={`${styles1.farmCard__element__left__logo} ${styles1.first
                } ${theme === "dark" ? styles1.dark : styles1.light}`}
            >
              <div
                className={`${styles1.farmCard__element__left__logo__main} ${theme === "dark" ? styles1.dark : styles1.light
                  }`}
              >
                <NextImage src={row.original.Image1} alt="" />
              </div>
            </div>
            <div
              className={`${styles1.farmCard__element__left__logo} ${styles1.last
                } ${theme === "dark" ? styles1.dark : styles1.light}`}
            >
              <div
                className={`${styles1.farmCard__element__left__logo__main} ${theme === "dark" ? styles1.dark : styles1.light
                  }`}
              >
                <NextImage src={row.original.Image2} alt="" />
              </div>
            </div>
          </div>

          <div
            className={`${styles1.farmCard__element__left__title} ${styles1.tableActive
              } ${theme === "dark" ? styles1.dark : styles1.light}`}
          >
            {value}
          </div>
        </div>
      )
    },
    {
      Header: "APR",
      accessor: "APR",
      Cell: ({ row, value }) => (
        <div
          className={`${styles1.portfolio__table__apr} ${theme === "dark" ? styles1.dark : styles1.light
            }`}
        >
          <NextImage src={row.original.Image3} alt="Logo" />
          {value}
        </div>
      )
    },
    {
      Header: "My Liquidity",
      accessor: "MyLiquidity",
      Cell: ({ value }) => (
        <div
          className={`${styles1.portfolio__table__liquidity} ${theme === "dark" ? styles1.dark : styles1.light
            }`}
        >
          ${value}
        </div>
      )
    },
    {
      Header: "Action",
      accessor: "Action",
      Cell: ({ value }) => (
        <div
          className={`${styles1.farmCard__buttonWrap} ${theme === "dark" ? styles1.dark : styles1.light
            }`}
        >
          <button>{"Manage"}</button>
        </div>
      )
    }
  ]

  const LiquidityData = [
    {
      Asset: "CMDX-CANTO",
      Image1: CMDS,
      Image2: ATOM,
      Image3: CMDS,
      APR: "External - 149%",
      MyLiquidity: 1.53
    }
  ]

  return (
    <>
      {active === "Assets" ? (
        <Table columns={COLUMNS} data={DATA} />
      ) : active === "Liquidity" ? (
        <Table columns={LiquidityCOLUMNS} data={LiquidityData} />
      ) : active === "History" ? (
        <Table columns={LiquidityCOLUMNS} data={[]} />
      ) : (
        ""
      )}
    </>
  )
}

export default PortfolioTable
