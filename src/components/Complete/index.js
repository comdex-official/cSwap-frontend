import "./index.scss";
import * as PropTypes from "prop-types";
import { Button } from "antd";
import { Col, Row, SvgIcon } from "../../components/common";
import { Link } from "react-router-dom";
import { amountConversionWithComma, denomConversion } from "../../utils/coin";
import React from "react";
import variables from "../../utils/variables";

const Complete = (props) => {
  return (
    <div className="comdex-card-content borrow-complete mt-4">
      <Row>
        <Col className="head-section d-flex align-items-center justify-content-center">
          <SvgIcon fill="#00ce8e" name="complete-icon" />
          <div className="ml-2">{variables[props.lang].complete}</div>
        </Col>
      </Row>
      <Row>
        <Col>
          <ul>
            {props.collateral ? (
              <li>
                <div className="left">{variables[props.lang].collateral}</div>
                <div className="right">
                  {
                    <>
                      <span>
                        {amountConversionWithComma(props.collateral.amount)}
                      </span>
                      <span>{denomConversion(props.collateral.denom)}</span>
                    </>
                  }
                </div>
              </li>
            ) : null}
            {props.ratio ? (
              <li>
                <div className="left">
                  {variables[props.lang].collateral_ratio}
                </div>
                <div className="right">{props.ratio} %</div>
              </li>
            ) : null}
            {props.debt ? (
              <li>
                <div className="left">
                  {variables[props.lang].borrowed_assets}
                </div>
                <div className="right">
                  {
                    <>
                      <span>
                        {amountConversionWithComma(props.debt.amount)}
                      </span>
                      <span>{denomConversion(props.debt.denom)}</span>
                    </>
                  }
                </div>
              </li>
            ) : null}
          </ul>
        </Col>
      </Row>
      <Row>
        <Col className="m-auto" sm="7">
          <Row>
            <Col className="text-small mb-2" sm="7">
              Tx Fee
            </Col>
            <Col className="text-small mb-2 text-right">+ 1.25 UST</Col>
          </Row>
          <Row>
            <Col className="text-small mb-2" sm="7">
              Tx Hash
            </Col>
            <Col className="text-small mb-2 text-right">
              <span>
                {props.transaction?.transactionHash ||
                  "969EC8581178777FA328588F396D7BF7D0223A619DF77D3CB44DE1F9A9D5CB2F"}
              </span>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col className="mx-auto mt-4" sm="6">
          <Link to="/balances">
            <Button block shape="round" size="large" type="primary">
              Balances
            </Button>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

Complete.propTypes = {
  lang: PropTypes.string.isRequired,
  collateral: PropTypes.shape({
    amount: PropTypes.string,
    denom: PropTypes.string,
  }),
  debt: PropTypes.shape({
    amount: PropTypes.string,
    denom: PropTypes.string,
  }),
  ratio: PropTypes.number,
  transaction: PropTypes.shape({
    transactionHash: PropTypes.string,
  }),
};

export default Complete;
