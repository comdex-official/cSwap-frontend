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
        width={630}
        isHidecloseButton={true}
      >
        <div className="d-flex flex-wrap flex-column">
          <h2>Disclaimer</h2>

          <div className="disclaimer-box-container">


            <p>
              Your access and/or use of (a) the website located at https://cswap.one/ (being the Website referred to in the Terms (as defined below); (b) the cSwap Smart Contracts; and (c) the Comdex Chain on which the cSwap Smart Contracts are deployed, including related trademarks, and other intellectual property, whether such access and/or use is via (i) the Website or (ii) command line, locally installed programs, Software Development Kits, software code and blockchain and smart contract explorers shall be subject to Terms of Use of cSwap (the “Terms”) (accessible at <a href="https://terms.comdex.one/Comdex_Cswap_Terms_and_Conditions.pdf">Terms of Use of cSwap </a>)  and in particular, to the various disclaimers and liability limitation set out in the section of the Terms entitled “Disclaimers and Limitation of Liability”.
            </p>


            <div className="border-box">
              <p>
                cSwap (which includes the Website, the cSwap Smart Contracts and Comdex Chain are not intended for (a) access and/or use by Excluded Persons; or (b) access and/or use by any person or entity in, or accessing or using the Website from, an Excluded Jurisdiction.
              </p>

              <p>
                Accordingly, if you are an Excluded Person or a person seeking to access
                and/or use cSwap from an Excluded Jurisdiction, you should not access and/or use
                or attempt to access and/or use cSwap.
              </p>
            </div>

            <p>
              The terms “cSwap Smart Contracts” and “Comdex Chain” (collectively referred to as “cSwap”) as well as “Excluded Persons” and “Excluded Jurisdictions” are as defined in the Terms.
            </p>

            <p>
              Upgrades and modifications to cSwap are managed in a community-driven way by governance vote of holders of the CMDX Token native to the Comdex blockchain. There may be changes to the Terms since you had last accessed and/or used cSwap.
            </p>

            <p>
              By proceeding to access and/or use cSwap you are agreeing to the prevailing Terms on behalf of yourself and any entity you represent, and you represent and warrant that you have the right and authority to do so.
            </p>

          </div>

          <div>
            <Checkbox
              checked={isChecked}
              onChange={() => {
                setIsChecked((value) => !value);
              }}
            >
              I have read and understood the Terms of Use and wish to proceed.
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