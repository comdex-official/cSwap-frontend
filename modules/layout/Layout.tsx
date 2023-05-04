import store from '@/logic/redux/store';
import { BackGround } from '@/shared/image';
import { NextImage } from '@/shared/image/NextImage';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

const Header = dynamic(() => import('@/shared/components/header/Header'));
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Provider store={store}>
      <Header />
      {children}

      <NextImage
        layout="fill"
        objectFit={true}
        className="object-center object-cover pointer-events-none"
        src={BackGround}
        alt={'Back'}
        style={{ zIndex: '-1' }}
      />
    </Provider>
  );
};

export default Layout;
