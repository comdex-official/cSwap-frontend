import { Button, Input, Select } from "antd";
import { Col, Row, SvgIcon } from "../../components/common";
import TransferModal from "./TransferModal";
import "./index.scss";

const { Option } = Select;

const AxelarBridge = () => {
  return (
    <div>
      <Row>
        <Col>
          <div className="assets-box">
            <div className="assets-right w-100">
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
          <div className="center-arrow">
            <SvgIcon name="buy-sell-arrow" viewbox="0 0 30.937 32.344" />
          </div>
          <div className="assets-box">
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
            <div className="text-right w-100">
              <Button size="small" className="max-btn">Max</Button>
              <Input placeholder='0.00000' />
            </div>
          </div>
          <div className="bottom-details">
            <Row>
              <Col className='bottom-col'>Source Token Address</Col>
              <Col className='bottom-col text-right'>weth1yzx64a.....3w9</Col>
            </Row>
            <Row>
              <Col className='bottom-col'>Destination Address</Col>
              <Col className='bottom-col text-right'>comdex1yzx64a.....3w9</Col>
            </Row>
            <Row>
              <Col className='bottom-col'>Source Token Balance</Col>
              <Col className='bottom-col text-right'><Button size="small" type="primary btn-filled connectwallet-btn">Connect Wallet</Button></Col>
            </Row>
            <Row>
              <Col className='bottom-col'>Bridge Fee</Col>
              <Col className='bottom-col text-right'>0</Col>
            </Row>
            <Row>
              <Col className='bottom-col'>Estimated Wait Time</Col>
              <Col className='bottom-col text-right'>~2 Minutes</Col>
            </Row>
          </div>
        </Col>
      </Row>
      <Row className='mt-4 text-center'>
        <Col>
          <TransferModal />
        </Col>
      </Row>
      <div className="poweredby">
        <small>Powered by</small>
        <div className="bottom-row"><SvgIcon name='cmdx-icon' /></div>
      </div>
    </div>
  );
};

export default AxelarBridge;
