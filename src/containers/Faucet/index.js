import { Button, Input } from "antd";
import { Col, Row } from "../../components/common";
import ReCAPTCHA from "react-google-recaptcha";
import "./index.scss";

function onChange(value) {
  console.log("Captcha value:", value);
}

const Faucet = () => {
  return (
    <div className="faucet-card">
      <h1>Get Faucet</h1>
      <p>Enter your address to get the faucet tokens</p>
      <Row className='mt-4'>
        <Col>
          <Input placeholder="Enter your address" />
        </Col>
      </Row>
      <Row className='my-4'>
        <Col className='text-center'>
          <ReCAPTCHA
            style={{ display: "inline-block" }}
            sitekey="Your client site key"
            onChange={onChange}
          />
        </Col>
      </Row>
      <Row className='mt-4'>
        <Col>
          <Button type="primary btn-filled" size="large">Send Tokens</Button>
        </Col>
      </Row>
    </div>
  );
};

export default Faucet;
