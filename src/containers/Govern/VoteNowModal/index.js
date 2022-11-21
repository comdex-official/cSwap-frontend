import { Button, message, Modal, Radio, Space } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import { Col, Row, SvgIcon } from "../../../components/common";
import Snack from "../../../components/common/Snack";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { defaultFee } from "../../../services/transaction";
import variables from "../../../utils/variables";
import "./index.scss";

const VoteNowModal = ({ address, proposal, lang, refreshVote }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [userVote, setUserVote] = useState();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setInProgress(true);
    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/cosmos.gov.v1beta1.MsgVote",
          value: {
            option: userVote,
            proposalId: Long.fromNumber(proposal?.proposal_id),
            voter: address,
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        setIsModalOpen(false);
        setUserVote();
        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        refreshVote();
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setUserVote();
  };

  return (
    <>
      <Button
        type="primary"
        className="btn-filled mb-n4"
        onClick={showModal}
        loading={inProgress}
        disabled={proposal?.status !== "PROPOSAL_STATUS_VOTING_PERIOD"}
      >
        Vote Now
      </Button>
      <Modal
        centered={true}
        className="votenow-modal"
        footer={null}
        header={null}
        open={isModalOpen}
        width={550}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
      >
        <div className="votenow-modal-inner">
          <Row>
            <Col sm="12">
              <h3>Your Vote</h3>
              <p>
                #{proposal?.proposal_id} {proposal?.content?.title}
              </p>
              <Radio.Group
                value={userVote}
                name="radiogroup"
                onChange={(e) => {
                  setUserVote(e.target.value);
                }}
              >
                <Space direction="vertical">
                  <Radio value={1}>Yes</Radio>
                  <Radio value={3}>No</Radio>
                  <Radio value={4}>No With Veto</Radio>
                  <Radio value={2}>Abstain</Radio>
                </Space>
              </Radio.Group>
            </Col>
          </Row>
          <Row className="p-0">
            <Col className="text-right mt-3">
              <Button
                type="primary"
                className="px-5 mr-3"
                size="large"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={inProgress}
                disabled={inProgress || !userVote}
                className="btn-filled px-5"
                size="large"
                onClick={handleOk}
              >
                Confirm
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

VoteNowModal.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshVote: PropTypes.func.isRequired,
  address: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(VoteNowModal);
