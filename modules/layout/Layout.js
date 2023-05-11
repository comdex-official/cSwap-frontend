import store from "../../logic/redux/store"
import { BackGround } from "../../shared/image"
import { NextImage } from "../../shared/image/NextImage"
import { useDispatch } from "react-redux"
import Header from "../../shared/components/header/Header"
import { useEffect } from "react"
import { envConfigResult, ibcAssets } from "../../config/ibc_assets"
import { setAssetList, setEnvConfig } from "../../actions/config"

const Layout = ({ children }) => {

  const dispatch = useDispatch()


  useEffect(() => {
    envConfigResult().then((result) => {
      dispatch(setEnvConfig(result?.envConfig))
    })
      .catch((err) => {
        console.log(err);
      });

    ibcAssets()
      .then((result) => {
        dispatch(setAssetList(result))
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
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
    </>
  )
}

export default Layout
