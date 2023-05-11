import store from "@/logic/redux/store"
import { BackGround } from "../../shared/image"
import { NextImage } from "../../shared/image/NextImage"
import dynamic from "next/dynamic"
import { Provider } from "react-redux"
import Header from "../../shared/components/header/Header"

// const Header = dynamic(() => import("@/shared/components/header/Header"))

const Layout = ({ children }) => {
  return (
    <Provider store={store}>
      <Header />
      {children}

      <NextImage
        layout="fill"
        objectFit={true}
        className="object-center object-cover pointer-events-none"
        src={BackGround}
        alt={"Back"}
        style={{ zIndex: "-1" }}
      />
    </Provider>
  )
}

export default Layout
