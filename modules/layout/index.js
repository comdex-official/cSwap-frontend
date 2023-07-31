import store from '../../reducers/store';
import { Provider } from 'react-redux';
import Header from '../../shared/components/header/Header';
import dynamic from 'next/dynamic';

const CautionNotice = dynamic(
  () => import('../../shared/components/CautionNotice'),
  {
    ssr: false,
  }
);

const Layout = ({ children }) => {
  return (
    <Provider store={store}>
      <CautionNotice />
      <Header />
      {children}
    </Provider>
  );
};

export default Layout;
