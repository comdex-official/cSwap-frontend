import { Input, Select } from "antd";
import { Col, Row, SvgIcon } from "../../components/common";
import "./index.scss";

import TransferModal from "./TransferModal";

const { Option } = Select;

const IbcTransfer = () => {
  return (
    <div>
      <Row>
        <Col>
          <div className="assets-box">
            <div className="assets-left">
              <h3>From</h3>
            </div>
            <div className="assets-right">
              <Select
                aria-label="Select"
                className="assets-select"
                popupClassName="asset-select-dropdown"
                placeholder={
                  <div className="select-placeholder">
                    <div className="assets-icon">
                      <div className="assets-icon-inner"></div>
                    </div>
                    Select
                  </div>
                }
                suffixIcon={<SvgIcon name="arrow-down" viewbox="0 0 19.244 10.483" />}
              >
                <Option key='1'>
                  <div className="select-inner">
                    <div className="assets-icon">
                      <div className="assets-icon-inner">
                        <SvgIcon name='juno-icon' />
                      </div>
                    </div>
                    <div className="name">JUNO</div>
                  </div>
                </Option>
                <Option key='2'>
                  <div className="select-inner">
                    <div className="assets-icon">
                      <div className="assets-icon-inner">
                        <SvgIcon name='cmdx-icon' />
                      </div>
                    </div>
                    <div className="name">JUNO</div>
                  </div>
                </Option>
              </Select>
            </div>
          </div>
          <div className="center-arrow">
            <SvgIcon name="buy-sell-arrow" viewbox="0 0 30.937 32.344" />
          </div>
          <div className="assets-box">
            <div className="assets-left">
              <h3>To</h3>
            </div>
            <div className="assets-right">
              <Select
                aria-label="Select"
                className="assets-select"
                popupClassName="asset-select-dropdown"
                placeholder={
                  <div className="select-placeholder">
                    <div className="assets-icon">
                      <div className="assets-icon-inner"></div>
                    </div>
                    Select
                  </div>
                }
                suffixIcon={<SvgIcon name="arrow-down" viewbox="0 0 19.244 10.483" />}
              >
                <Option key='1'>
                  <div className="select-inner">
                    <div className="assets-icon">
                      <div className="assets-icon-inner">
                        <SvgIcon name='cmdx-icon' />
                      </div>
                    </div>
                    <div className="name">JUNO</div>
                  </div>
                </Option>
                <Option key='2'>
                  <div className="select-inner">
                    <div className="assets-icon">
                      <div className="assets-icon-inner">
                        <SvgIcon name='cmdx-icon' />
                      </div>
                    </div>
                    <div className="name">JUNO</div>
                  </div>
                </Option>
              </Select>
            </div>
          </div>
          <div className="assets-box mt-3">
            <div className="assets-right">
              <Select
                aria-label="Select"
                className="assets-select"
                popupClassName="asset-select-dropdown"
                placeholder={
                  <div className="select-placeholder">
                    <div className="assets-icon">
                      <div className="assets-icon-inner"></div>
                    </div>
                    Select
                  </div>
                }
                suffixIcon={<SvgIcon name="arrow-down" viewbox="0 0 19.244 10.483" />}
              >
                <Option key='1'>
                  <div className="select-inner">
                    <div className="assets-icon">
                      <div className="assets-icon-inner">
                        <SvgIcon name='cmdx-icon' />
                      </div>
                    </div>
                    <div className="name">JUNO</div>
                  </div>
                </Option>
                <Option key='2'>
                  <div className="select-inner">
                    <div className="assets-icon">
                      <div className="assets-icon-inner">
                        <SvgIcon name='cmdx-icon' />
                      </div>
                    </div>
                    <div className="name">JUNO</div>
                  </div>
                </Option>
              </Select>
            </div>
            <Input placeholder='0.00000' />
          </div>
          <div className="bottom-details">
            <Row>
              <Col className='bottom-col'>Source Address</Col>
              <Col className='bottom-col text-right'>juno1yzx64a.....3w9</Col>
            </Row>
            <Row>
              <Col className='bottom-col'>Destination Address</Col>
              <Col className='bottom-col text-right'>Destination Address</Col>
            </Row>
            <Row>
              <Col className='bottom-col'>Estimated Wait Time</Col>
              <Col className='bottom-col text-right'>~2 Minutes</Col>
            </Row>
            <Row>
              <Col className='bottom-col'>Maximum Transfer Amount</Col>
              <Col className='bottom-col text-right'>1,000,000 CMDX</Col>
            </Row>
          </div>
        </Col>
      </Row>
      <Row className='mt-4 text-center'>
        <Col>
          <TransferModal />
        </Col>
      </Row>
    </div>
  );
};

export default IbcTransfer;
