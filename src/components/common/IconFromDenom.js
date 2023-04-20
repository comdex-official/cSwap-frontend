import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { denomConversion } from "../../utils/coin";

const IconFromDenom = ({ denom, tokenImages }) => {
  return tokenImages[denom]?.coinImageUrl ? (
    <img
      src={tokenImages[denom]?.coinImageUrl}
      alt={denomConversion(denom || "")}
      width={40}
      height={40}
    />
  ) : (
    <img src="" alt="" width={40} height={40} />
    // default icon to show
  );
};

IconFromDenom.propTypes = {
  denom: PropTypes.string,
  tokenImages: PropTypes.array,
};

const stateToProps = (state) => {
  return {
    tokenImages: state.asset.tokenImages,
  };
};

export default connect(stateToProps)(IconFromDenom);
