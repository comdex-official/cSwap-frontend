import { Button, Modal, Checkbox } from "antd";
import React, { useState } from "react";
import "./index.scss";

const CautionNotice = () => {
  const [isVisible, setIsVisible] = useState(
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
        visible={isVisible}
        width={550}
        isHidecloseButton={true}
      >
        <div className="d-flex flex-wrap flex-column">
          <h2>Caution Notice</h2>
          <p>
            Trading involves a significant risk of loss and is not suitable for
            all investors, in particular, past developments do not necessarily
            indicate future results
          </p>
          <h3>TRADE AT YOUR OWN RISK</h3>
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
                setIsVisible(false);
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
