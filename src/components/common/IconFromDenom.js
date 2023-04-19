import * as PropTypes from "prop-types";
import TokenImages from "../../config/tokens.json";

const IconFromDenom = ({ denom }) => {
  return TokenImages[denom]?.coinImageUrl ? (
    <img
      src={TokenImages[denom]?.coinImageUrl}
      alt={denom}
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
};

export default IconFromDenom;
