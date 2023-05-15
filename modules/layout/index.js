import store from "../../logic/redux/store";
import { Provider } from "react-redux";
import Header from "../../shared/components/header/Header";

const Layout = ({ children }) => {
  return (
    <Provider store={store}>
      <Header />
      {children}
    </Provider>
  );
};

export default Layout;
