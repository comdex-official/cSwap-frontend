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
      <div className="row">
        <div>Min Price</div>
        <div className="col">{`:`}</div>
        <div>{`${min}`}</div>
      </div>
      <div className="row">
        <div>Max Price</div>
        <div className="col">{`:`}</div>
        <div>{`${max}`}</div>
      </div>
      <div className="row">
        <div>Current Price</div>
        <div className="col">{`:`}</div>
        <div>{`${price}`}</div>
      </div>
      <div className="row">
        <div>AMP</div>
        <div className="col">{`:`}</div>
        <div>{amp ? `x${amp}` : ""}</div>
      </div>
    </div>
  );
};

export default RangeTooltipContent;
