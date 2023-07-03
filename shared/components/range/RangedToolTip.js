import { Col, InputNumber, Row, Slider } from "antd";
import { useState } from "react";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { getAMP, rangeToPercentage } from "../../../utils/number";

const RangeTooltipContent = ({ min, max, price, parent }) => {
  const marks = {
    0: Number(min).toFixed(DOLLAR_DECIMALS),
    100: Number(max).toFixed(DOLLAR_DECIMALS),
  };

  let amp = getAMP(price, min, max)?.toFixed(DOLLAR_DECIMALS);

  return (
    <div>
      {parent === "pool" ? (
        <div>
          <div className="text-center">
            <small>
              {price > min && price < max ? (
                <span className="success-color">In range</span>
              ) : (
                <span className="warn-color">Out of range</span>
              )}
            </small>
          </div>
          <div className="">
            <Slider
              className="farm-slider farm-slider-small"
              tooltip={{ open: false }}
              value={rangeToPercentage(min, max, price)}
              marks={marks}
            />
          </div>
        </div>
      ) : null}
      <Row style={{ marginTop: parent === "pool" ? "25px" : "0" }}>
        <Col>Min Price <span className="ml-2">:</span></Col>
        <Col>
           {min}
        </Col>
      </Row>
      <Row>
        <Col>Max Price  <span className="ml-2">:</span></Col>
        <Col>
          {max}
        </Col>
      </Row>
      <Row>
        <Col>Current Price <span className="ml-2">:</span></Col>
        <Col>
           {price}
        </Col>
      </Row>
      <Row>
        <Col>AMP <span className="ml-2">:</span></Col>
        <Col>
           {amp ? `x${amp}` : ""}
        </Col>
      </Row>
    </div>
  );
};

export default RangeTooltipContent;