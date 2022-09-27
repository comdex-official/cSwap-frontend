import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../components/common";
import TooltipIcon from "../../components/TooltipIcon";
import { denomConversion } from "../../utils/coin";
import { iconNameFromDenom } from "../../utils/string";
import variables from "../../utils/variables";

export const Asset = ({ asset, lang }) => {
  return (
    <div className="cswap-head">
      <div className="header-left">
        <div className="icon-circle">
          <div className="svg-icon-inner">
            <SvgIcon
              name={iconNameFromDenom(asset?.denom)}
              viewbox="0 0 26.229 14"
            />
          </div>
        </div>
        <div>{asset ? denomConversion(asset.denom) : ""}</div>
      </div>
      <div className="head-right">
        <Row>
          <Col xs="6" className="mb-2">
            <label>
              Oracle Price <TooltipIcon text={variables[lang].oracle_price_tooltip} />
            </label>
            <p>
              -
            </p>
          </Col>
          <Col xs="6" className="mb-2">
            <label>
              Volume <TooltipIcon text={variables[lang].volume_tooltip} />
            </label>
            <p>
              -
            </p>
          </Col>
          <Col xs="6" className="mb-2">
            <label>
              Premium <TooltipIcon text={variables[lang].premium_tooltip} />
            </label>
            <p>-</p>
          </Col>
          <Col xs="6" className="mb-2">
            <label>
              Liquidity <TooltipIcon text={variables[lang].liquidity_tooltip} />
            </label>
            <p>
              -
            </p>
          </Col>
        </Row>
      </div>
    </div>
  );
};

Asset.propTypes = {
  lang: PropTypes.string.isRequired,
  poolBalance: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  text: PropTypes.string,
  premium: PropTypes.string,
};

export default Asset;
