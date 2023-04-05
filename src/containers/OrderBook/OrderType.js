import { Button } from "antd";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { setType } from "../../actions/order";
import { SvgIcon } from "../../components/common";

const OrderType = ({ setType, type }) => {
  return (
    <div className="dtl-header">
      <div>
        <Button
          className="btn-filled"
          type={type === "limit" ? "primary" : ""}
          onClick={() => setType("limit")}
        >
          {" "}
          Limit
        </Button>
        <Button
          className="btn-filled"
          type={type === "market" ? "primary" : ""}
          onClick={() => setType("market")}
        >
          Market
        </Button>
      </div>
      <SvgIcon name="info-icon-alt" viewbox="0 0 26 26" />
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
