import { Button, Input } from "antd";
import React from "react";
import { SvgIcon, Row, Col } from "../../components/common";
import "./index.scss";

const Buy = ({}) => {
  return  (
    <>
      <div className="spot-card-dtl">
        <div className="dtl-header">
          <div>Limit   <label>Market</label></div>
          <SvgIcon name='info-icon-alt' viewbox='0 0 26 26' />
        </div>
        <div className="avai-balance-dtl">
          <p>Available Balance</p><h4>0.00 CMST</h4><label>=$0.00</label>
        </div>
        <div className="price-dtl">
          <div className="price-dtl-row">
            <label>Price</label>
            <Input defaultValue="1.1796" suffix={"CMDX"} />
          </div>
          <div className="price-dtl-row">
            <label>Price</label>
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
          <Col>
            <Button type="primary" size="large" block>Reset</Button>
          </Col>
          <Col>
            <Button type="primary" className="btn-filled" size="large" block>Buy BCRE</Button>
          </Col>
        </Row>
      </div>
    </>
  )
};



export default Buy;
