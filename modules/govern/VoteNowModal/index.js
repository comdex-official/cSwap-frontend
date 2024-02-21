import { Button, message, Modal } from 'antd';
import Long from 'long';
import * as PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Snack from '../../../shared/components/Snack/index';
import { signAndBroadcastTransaction } from '../../../services/helper';
import { defaultFee } from '../../../services/transaction';
import { errorMessageMappingParser } from '../../../utils/string';
import variables from '../../../utils/variables';
import { Icon } from '../../../shared/image/Icon';

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
          typeUrl: '/cosmos.gov.v1beta1.MsgVote',
          value: {
            option: userVote,
            proposalId: Long.fromNumber(proposal?.proposal_id),
            voter: address,
          },
        },
        fee: defaultFee(),
        memo: '',
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
          message.info(errorMessageMappingParser(result?.rawLog));
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
        className="btn-filled2 voote__now"
        onClick={showModal}
        loading={inProgress}
        disabled={proposal?.status !== "PROPOSAL_STATUS_VOTING_PERIOD"}
      >
        Vote Now
      </Button>
      <Modal
        centered={true}
        className="vote-now-modal"
        footer={null}
        header={null}
        open={isModalOpen}
        width={550}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={<Icon className={'bi bi-x-lg'} />}
      >
        <div className="votenow-modal-inner">
          <div>
            <div sm="12">
              <h3>Vote Now</h3>
        
              <div className="votenow-modal-element-main">
                <div
                  className={
                    'votenow-modal-element ' + (userVote === 1 ? 'active' : '')
                  }
                  onClick={(e) => {
                    setUserVote(1);
                  }}
                >
                  Yes
                </div>
                <div
                  className={
                    'votenow-modal-element ' + (userVote === 3 ? 'active' : '')
                  }
                  onClick={(e) => {
                    setUserVote(3);
                  }}
                >
                  No
                </div>
                <div
                  className={
                    'votenow-modal-element ' + (userVote === 4 ? 'active' : '')
                  }
                  onClick={(e) => {
                    setUserVote(4);
                  }}
                >
                  No With Veto
                </div>
                <div
                  className={
                    'votenow-modal-element ' + (userVote === 2 ? 'active' : '')
                  }
                  onClick={(e) => {
                    setUserVote(2);
                  }}
                >
                  Abstain
                </div>
              </div>
            </div>
          </div>
          <div className="p-0">
            <div className="button__vote mt-3">
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
            </div>
          </div>
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
