// import { useAppSelector } from "@/shared/hooks/useAppSelector"
import dynamic from "next/dynamic"
import { useSelector } from "react-redux"
import styles from "./Bridge.module.scss"
import BridgeCard from "./BridgeCard"

// const BridgeCard = dynamic(() => import("@/modules/bridge/BridgeCard"))

const Bridge = () => {
  const theme = useSelector(state => state.theme.theme)

  return (
    <div className={styles.bridge__wrap}>
      <BridgeCard theme={theme} />
    </div>
  )
}

export default Bridge
