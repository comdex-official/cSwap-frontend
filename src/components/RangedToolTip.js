import { Slider } from "antd";
import { DOLLAR_DECIMALS } from "../constants/common";
import { getAMP, rangeToPercentage } from "../utils/number";
import { Col, Row } from "./common";

const RangeTooltipContent = ({ min, max, price, parent }) => {
  const marks = {
    0: min,
    100: max,
  };

  let amp = getAMP(price, min, max)?.toFixed(DOLLAR_DECIMALS);

  return (
    <div>
      {parent === "pool" ? (
        <Row>
          <Col>
            <div className="text-center">
              <small>
                {price > min && price < max ? "In range" : "Out of range"}
              </small>
            </div>
            <Slider
              className="farm-slider farm-slider-small"
              tooltip={{ open: false }}
              value={rangeToPercentage(min, max, price)}
              marks={marks}
            />
          </Col>
        </Row>
      ) : null}
      <Row>
        <Col>Min Price</Col>
        <Col>
          <span className="mr-2">:</span> {min}
        </Col>
      </Row>
      <Row>
        <Col>Max Price</Col>
        <Col>
          <span className="mr-2">:</span> {max}
        </Col>
      </Row>
      <Row>
        <Col>Current Price</Col>
        <Col>
          <span className="mr-2">:</span> {price}
        </Col>
      </Row>
      <Row>
        <Col>AMP</Col>
        <Col>
          <span className="mr-2">:</span> {amp ? `x${amp}` : ""}
        </Col>
      </Row>
    </div>
  );
};

export default RangeTooltipContent;
