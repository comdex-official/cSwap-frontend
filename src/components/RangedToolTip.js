import { Slider } from "antd";
import { DOLLAR_DECIMALS } from "../constants/common";
import { getAMP } from "../utils/number";
import { Col, Row } from "./common";

const RangeTooltipContent = ({ min, max, price }) => {
  const marks = {
    0: min,
    100: max,
  };

  let amp = getAMP(price, min, max)?.toFixed(DOLLAR_DECIMALS);

  return (
    <div>
      <Row>
        <Col>
          <div className="text-center">
            <small>In Range</small>
          </div>
          <Slider
            className="farm-slider farm-slider-small"
            tooltip={{ open: false }}
            value={2.01}
            defaultValue={price}
            marks={marks}
          />
        </Col>
      </Row>
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
