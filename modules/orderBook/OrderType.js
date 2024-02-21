import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { setType } from "../../actions/order";
import styles from "./OrderBook.module.scss";

const OrderType = ({ setType, type }) => {
  const theme = "dark";

  return (
    <div
      className={`${styles.orderbook__element__right__body__tab} ${
        theme === "dark" ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.orderbook__body__tab__head} ${
          theme === "dark" ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.orderbook__body__tab__head__element} ${
            type === "limit" ? styles.active : ""
          } ${theme === "dark" ? styles.dark : styles.light}`}
          onClick={() => setType("limit")}
        >
          {"Limit"}
        </div>
        <div
          className={`${styles.orderbook__body__tab__head__element} ${
            type === "market" ? styles.active : ""
          } ${theme === "dark" ? styles.dark : styles.light}`}
          onClick={() => setType("market")}
        >
          {"MARKET"}
        </div>
      </div>
    </div>
  );
};

OrderType.propTypes = {
  address: PropTypes.string,
  type: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    type: state.order.type,
  };
};

const actionsToProps = {
  setType,
};

export default connect(stateToProps, actionsToProps)(OrderType);
