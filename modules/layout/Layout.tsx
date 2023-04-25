import store from '@/logic/redux/store';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <Provider store={store}>{children}</Provider>;
};

export default Layout;
