import { Button, Form, message, Modal } from "antd";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import { setBalanceRefresh } from "../../../actions/account";
import { fetchProofHeight } from "../../../actions/asset";
import { Col, Row, SvgIcon } from "../../../components/common";
import Snack from "../../../components/common/Snack";
import CustomInput from "../../../components/CustomInput";
import { comdex } from "../../../config/network";
import { ValidateInputNumber } from "../../../config/_validation";
import { aminoSignIBCTx } from "../../../services/helper";
import { getChainConfig, initializeIBCChain } from "../../../services/keplr";
import { defaultFee } from "../../../services/transaction";
import { denomConversion, getAmount } from "../../../utils/coin";
import { toDecimals, truncateString } from "../../../utils/string";
import variables from "../../../utils/variables";
import "./index.scss";

const Withdraw = ({
  lang,
  chain,
  address,
  refreshBalance,
  setBalanceRefresh,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [amount, setAmount] = useState();
  const [proofHeight, setProofHeight] = useState(0);
  const [validationError, setValidationError] = useState();

  const onChange = (value) => {
    value = toDecimals(value).toString().trim();

    setAmount(value);
    setValidationError(ValidateInputNumber(value, chain?.balance?.amount));
  };

  const showModal = () => {
    initializeIBCChain(chain.chainInfo, (error, account) => {
      if (error) {
        message.error(error);
        return;
      }
      setDestinationAddress(account?.address);
      fetchProofHeight(
        chain.chainInfo?.rest,
        chain.sourceChannelId,
        (error, data) => {
          if (error) return;

          setProofHeight(data);
        }
      );
    });
    setIsModalVisible(true);
  };

  const signIBCTx = () => {
    setInProgress(true);

    if (!proofHeight?.revision_height) {
      message.error("Unable to get the latest block height");
      setInProgress(false);
      return;
    }

    const data = {
      msg: {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: {
          source_port: "transfer",
          source_channel: chain?.sourceChannelId,
          token: {
            denom: chain?.ibcDenomHash,
            amount: getAmount(amount),
          },
          sender: address,
          receiver: destinationAddress,
          timeout_height: {
            revisionNumber: Number(proofHeight?.revision_number),
            revisionHeight: Number(proofHeight?.revision_height) + 100,
          },
          timeout_timestamp: undefined,
        },
      },
      fee: defaultFee(),
      memo: "",
    };

    aminoSignIBCTx(getChainConfig(), data, (error, result) => {
      setInProgress(false);

      if (error) {
        if (result?.transactionHash) {
          message.error(
            <Snack
              message={variables[lang].tx_failed}
              explorerUrlToTx={chain.chainInfo.explorerUrlToTx}
              hash={result?.transactionHash}
            />
          );
        } else {
          message.error(error);
        }
        return;
      }

      message.success(
        <Snack
          message={variables[lang].tx_success}
          explorerUrlToTx={comdex?.explorerUrlToTx}
          hash={result?.transactionHash}
        />
      );

      setBalanceRefresh(refreshBalance + 1);
      setIsModalVisible(false);
    });
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" size="small" onClick={showModal}>
        {variables[lang].withdraw}
      </Button>
      <Modal
        className="asstedepositw-modal"
        centered={true}
        closable={true}
        footer={null}
        visible={isModalVisible}
        width={480}
        onCancel={handleCancel}
        onOk={handleOk}
        closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
        title="IBC Withdraw"
      >
        <Form layout="vertical">
          <Row>
            <Col>
              <Form.Item label="From">
                <CustomInput
                  type="text"
                  value={truncateString(address, 9, 9)}
                  disabled
                />
              </Form.Item>
            </Col>
            <SvgIcon name="arrow-right" viewbox="0 0 17.04 15.13" />
            <Col>
              <Form.Item label="To">
                <CustomInput
                  type="text"
                  value={truncateString(destinationAddress, 9, 9)}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className="position-relative">
              <div className="availabe-balance">
                {variables[lang].available}
                <span className="ml-1">
                  {chain?.balance?.amount || 0}{" "}
                  {denomConversion(chain?.coinMinimalDenom) || ""}
                </span>
                <span className="assets-maxhalf">
                  <Button
                    className=" active"
                    onClick={() => {
                      setAmount(chain?.balance?.amount || 0);
                    }}
                  >
                    {variables[lang].max}
                  </Button>
                </span>
              </div>
              <Form.Item
                label="Amount to Withdraw"
                className="assets-input-box"
              >
                <CustomInput
                  value={amount}
                  onChange={(event) => onChange(event.target.value)}
                  validationError={validationError}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className="text-center mt-2">
              <Button
                loading={inProgress}
                type="primary"
                disabled={
                  inProgress || !Number(amount) || validationError?.message
                }
                onClick={signIBCTx}
                className="btn-filled modal-btn"
              >
                {variables[lang].withdraw}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

Withdraw.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  address: PropTypes.string,
  chain: PropTypes.any,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
  };
};

const actionsToProps = {
  setBalanceRefresh,
};

export default connect(stateToProps, actionsToProps)(Withdraw);
