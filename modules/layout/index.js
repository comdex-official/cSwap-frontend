import store from "../../logic/redux/store"
import dynamic from "next/dynamic"
import { useEffect } from "react"
import { Provider } from "react-redux"
// import { configResult, AssetList } from "@/logic/redux/slices/configSlice"
// import { envConfigResult } from "@/config/envConfig"
// import { ibcAssets } from "@/config/ibc_assets"
// import fs from 'fs';
import Header from "../../shared/components/header/Header"

// const Header = dynamic(() => import("@/shared/components/header/Header"))

const Layout = ({ children }) => {
    // useEffect(() => {
    //     envConfigResult()
    //         .then(result => {
    //             // store.dispatch(configResult(result))
    //         })
    //         .catch(err => {
    //             console.log(err)
    //         })

    //     ibcAssets()
    //         .then(result => {
    //             // store.dispatch(AssetList(result))
    //         })
    //         .catch(err => {
    //             console.log(err)
    //         })
    // }, [])

    return (
        <Provider store={store}>
            <Header />
            {children}
        </Provider>
    )
}

export default Layout
