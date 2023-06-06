import { Col, Row, Slider } from "antd";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getAMP, rangeToPercentage } from "../../utils/number";
// import { Col, Row } from "./common";

const OrderBookTooltipContent = ({
  price,
  base,
  quote,
  sumBase,
  sumQuote,
  total,
}) => {
  return (
    <div>
      <Row>
        <Col>
          Avg Price <span className="ml-2">:</span>
        </Col>
        <Col>{price}</Col>
      </Row>
      <Row>
        <Col>
          Sum {base} <span className="ml-2">:</span>
        </Col>
        <Col>{sumBase}</Col>
      </Row>
      <Row>
        <Col>
          Sum {quote} <span className="ml-2">:</span>
        </Col>
        <Col>{sumQuote}</Col>
      </Row>
      <Row>
        <Col>
          Total <span className="ml-2">:</span>{" "}
        </Col>
        <Col>{total ? `${total}` : ""}</Col>
      </Row>
    </div>
  );
};

export default OrderBookTooltipContent;
