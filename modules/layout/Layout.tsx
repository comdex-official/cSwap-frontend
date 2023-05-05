import store from '@/logic/redux/store';
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
    </Provider>
  );
};

export default Layout;
