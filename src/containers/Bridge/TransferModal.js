import React, { useState } from 'react';
import { Button, Modal } from "antd";
import { Col, Row } from "../../components/common";
import "./index.scss";

const TransferModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Button type="primary btn-filled" size="large" onClick={showModal}>Transfer</Button>
      <Modal className='transfer-modal' width={650} centered title={false} open={isModalOpen} onCancel={handleCancel} closable={false} footer={false}>
        <Row>
          <Col sm="12">
            <ul>
              <li>
                <div className='left-col'>
                  Source Address
                </div>
                <div className='right-col'>
                  weth1yzx64a.....3w9
                </div>
              </li>
              <li>
                <div className='left-col'>
                  Destination Address
                </div>
                <div className='right-col'>
                  comdex1yzx64a.....3w9
                </div>
              </li>
              <li>
                <div className='left-col'>
                  Estimated Wait Time
                </div>
                <div className='right-col'>
                  ~2 Minutes
                </div>
              </li>
            </ul>
          </Col>
          <Col sm="12" className='text-center mt-4'>
            <Button type="primary btn-filled" size="large" onClick={handleCancel}>Transfer</Button>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default TransferModal;
