import store from '@/logic/redux/store';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import axios from "axios";
// import fs from 'fs';

const Header = dynamic(() => import('@/shared/components/header/Header'));
interface LayoutProps {
  children: ReactNode;
}
type FetchRestProposerCallback = (error: string | null, data?: any) => void;


const Layout = ({ children }: LayoutProps) => {


  const fetchRestProposer = (callback: FetchRestProposerCallback): void => {
    axios
      .get(
        "https://srinu-assets.comdex.one/devnet_ibc_assets.json"
      )
      .then((result) => {
        callback(null, result?.data);
      })
      .catch((error) => {
        callback(error?.message);
      });
  };


  // useEffect(() => {

  //   console.log("hello in layout");
  //   fetchRestProposer((error, data) => {
  //     if (error) {
  //       console.log(error, "Error");
  //       return;
  //     }
  //     console.log(data, "Api res");
  //     fs.writeFileSync('./test.txt', JSON.stringify(data))
  //   });
  // }, []);





  return (
    <Provider store={store}>
      <Header />
      {children}
    </Provider>
  );
};

export default Layout;
