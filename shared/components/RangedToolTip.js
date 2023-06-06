import { Col, Row, Slider } from "antd";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getAMP, rangeToPercentage } from "../../utils/number";
// import { Col, Row } from "./common";

const RangeTooltipContent = ({ min, max, price, parent }) => {
  const marks = {
    0: min,
    100: max,
  };

  let amp = getAMP(price, min, max)?.toFixed(DOLLAR_DECIMALS);

  return (
    <div>
      {parent === "pool" ? (
        <>
          <div className="text-center ranged2">
            <small>
              {price > min && price < max ? (
                <span className="success-color">In range</span>
              ) : (
                <span className="warn-color">Out of range</span>
              )}
            </small>
          </div>
          <div className="ranged-slider-over">
            <Slider
              className="farm-slider farm-slider-small"
              tooltip={{ open: false }}
              value={rangeToPercentage(min, max, price)}
              marks={marks}
            />
          </div>
        </>
      ) : null}
      <Row>
        <Col>Min Price  <span className="ml-2">:</span></Col>
        <Col>
          {min}
        </Col>
      </Row>
      <Row>
        <Col>Max Price <span className="ml-2">:</span></Col>
        <Col>
           {max}
        </Col>
      </Row>
      <Row>
        <Col>Current Price  <span className="ml-2">:</span></Col>
        <Col>
          {price}
        </Col>
      </Row>
      <Row>
        <Col>AMP <span className="ml-2">:</span> </Col>
        <Col>
          {amp ? `x${amp}` : ""}
        </Col>
      </Row>
    </div>
  );
};

export default RangeTooltipContent;
