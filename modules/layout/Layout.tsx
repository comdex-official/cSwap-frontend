import store from '@/logic/redux/store';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import axios from 'axios';
import { configResult, AssetList } from '@/logic/redux/slices/configSlice';
import { envConfigResult } from '@/config/envConfig';
import { ibcAssets } from '@/config/ibc_assets';
// import fs from 'fs';

const Header = dynamic(() => import('@/shared/components/header/Header'));
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useEffect(() => {
    envConfigResult()
      .then((result) => {
        store.dispatch(configResult(result));
      })
      .catch((err) => {
        console.log(err);
      });

    ibcAssets()
      .then((result) => {
        store.dispatch(AssetList(result));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Provider store={store}>
      {/* <SvgSprite url={svgFile} /> */}
      <Header />
      {children}
    </Provider>
  );
};

export default Layout;
