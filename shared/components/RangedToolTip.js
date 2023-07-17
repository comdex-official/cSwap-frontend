import { Col, Row, Slider } from 'antd';
import { DOLLAR_DECIMALS } from '../../constants/common';
import { getAMP, rangeToPercentage } from '../../utils/number';

const RangeTooltipContent = ({ min, max, price, parent }) => {
  const marks = {
    0: min,
    100: max,
  };

  let amp = getAMP(price, min, max)?.toFixed(DOLLAR_DECIMALS);

  return (
    <div>
      {parent === 'pool' ? (
        <>
          <div className="text-center ranged2">
            <small>
              {price > min && price < max ? (
                <span className="success-color2">In range</span>
              ) : (
                <span className="warn-color2">Out of range</span>
              )}
            </small>
          </div>
          <div className="ranged-slider-over">
            <Slider
              className="farm-slider"
              tooltip={{ open: false }}
              value={rangeToPercentage(min, max, price)}
              marks={marks}
            />
          </div>
        </>
      ) : null}
      <Row>
        <Col className="ranged-tooltip-title">
          Min Price <span className="ml-2">:</span>
        </Col>
        <Col className="ranged-tooltip-title">{min}</Col>
      </Row>
      <Row>
        <Col className="ranged-tooltip-title">
          Max Price <span className="ml-2">:</span>
        </Col>
        <Col className="ranged-tooltip-title">{max}</Col>
      </Row>
      <Row>
        <Col className="ranged-tooltip-title">
          Current Price <span className="ml-2">:</span>
        </Col>
        <Col className="ranged-tooltip-title">{price}</Col>
      </Row>
      <Row>
        <Col className="ranged-tooltip-title">
          AMP <span className="ml-2">:</span>{' '}
        </Col>
        <Col className="ranged-tooltip-title">{amp ? `x${amp}` : ''}</Col>
      </Row>
    </div>
  );
};

export default RangeTooltipContent;
