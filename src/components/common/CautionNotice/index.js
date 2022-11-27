import { Button, Checkbox, Modal } from "antd";
import React, { useState } from "react";
import "./index.scss";

const CautionNotice = () => {
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("agreement_accepted") === null
  );
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <Modal
        centered={true}
        className="caution-notice-modal"
        footer={null}
        header={null}
        open={isOpen}
        width={570}
        isHidecloseButton={true}
      >
        <div className="d-flex flex-wrap flex-column">
          <h2>Disclaimer</h2>
          <p>
            cSwap is a fully decentralised orderbook-style Interchain DEX built on Comdex.
            <br />
            By accessing and/or using cSwap, User  agree to these <a href="https://terms.comdex.one/Comdex_Cswap_Terms_and_Conditions.pdf" rel="noreferrer"  target="_blank">Terms and Conditions</a>  on behalf of yourself and any entity you represent, and you represent and warrant that you have the right and authority to do so.
          </p>
          {/* <h3>TRADE AT YOUR OWN RISK</h3> */}
          <div>
            <Checkbox
              checked={isChecked}
              onChange={() => {
                setIsChecked((value) => !value);
              }}
            >
              I have read and understand these risks, and wish to proceed.
            </Checkbox>
          </div>
          <div className="d-flex agree-btn">
            <Button
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                localStorage.setItem("agreement_accepted", "true");
              }}
              disabled={!isChecked}
              name="Agree"
              type="primary"
              className="btn-filled"
            >
              Agree
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CautionNotice;