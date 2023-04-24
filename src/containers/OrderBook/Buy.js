import { Button, Input } from "antd";
import React from "react";
import { SvgIcon, Row, Col } from "../../components/common";
import "./index.scss";

const Buy = ({}) => {
  return  (
    <>
      <div className="spot-card-dtl">
        <div className="dtl-header">
          <div><label className="active">Limit</label> <label>Market</label></div>
        </div>
        <div className="price-dtl">
          <div className="balance-text">
            Balance: 0.0000 CMST
          </div>
          <div className="price-dtl-row">
            <label>Price</label>
            <Input defaultValue="1.1796" suffix={"CMDX"} />
          </div>
          <div className="price-dtl-row">
            <label>Quantity</label>
            <Input defaultValue="1.1796" suffix={"CMST"} />
          </div>
          <div className="btn-row">
            <Button>10%</Button>
            <Button>25%</Button>
            <Button>50%</Button>
            <Button>100%</Button>
          </div>
        </div>
        <Row className="total-row">
          <Col className='total-title'>Total</Col>
          <Col className='total-right'>
            <p>0 CMDX</p>
            <label>=$0.00</label>
          </Col>
        </Row>
        <Row className='mt-4 pt-2'>
          <Col sm='7' className='mx-auto'>
            <Button type="primary" size="large" block>Place Order</Button>
          </Col>
        </Row>
      </div>
    </>
  )
};



export default Buy;
