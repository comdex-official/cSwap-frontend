import { Slider } from "antd";
import { Col, Row } from "./common";

const RangeTooltipContent = ({ min, max, value }) => {
  const marks = {
    0: min,
    100: max,
  };

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
            value={value}
            defaultValue={value}
            marks={marks}
          />
        </Col>
      </Row>
      <Row>
        <Col>Min Prize</Col>
        <Col>
          <span className="mr-2">:</span> 0.98
        </Col>
      </Row>
      <Row>
        <Col>Max Price</Col>
        <Col>
          <span className="mr-2">:</span> 1.02
        </Col>
      </Row>
      <Row>
        <Col>Current Price</Col>
        <Col>
          <span className="mr-2">:</span> 1.02
        </Col>
      </Row>
      <Row>
        <Col>AMP</Col>
        <Col>
          <span className="mr-2">:</span> x40
        </Col>
      </Row>
    </div>
  );
};

export default RangeTooltipContent;
