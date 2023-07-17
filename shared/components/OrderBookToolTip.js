import { Col, Row } from 'antd';

const OrderBookTooltipContent = ({ price, total }) => {
  return (
    <div className={'orderbook__tooltip'}>
      <Row>
        <Col>Avg Price</Col>
        <Col>
          {' '}
          <span className="ml-2">~</span> {Number(price).toFixed(3)}
        </Col>
      </Row>
      <Row>
        <Col>Total USD</Col>
        <Col>
          <span className="ml-2">~</span> ${Number(total).toFixed(2)}
        </Col>
      </Row>
    </div>
  );
};

export default OrderBookTooltipContent;
