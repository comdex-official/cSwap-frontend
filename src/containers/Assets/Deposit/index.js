import { Button, Form, message, Modal, Spin } from "antd";
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
import { DEFAULT_FEE } from "../../../constants/common";
import { queryBalance } from "../../../services/bank/query";
import { aminoSignIBCTx } from "../../../services/helper";
import { initializeIBCChain } from "../../../services/keplr";
import {
  amountConversion,
  denomConversion,
  getAmount
} from "../../../utils/coin";
import { toDecimals, truncateString } from "../../../utils/string";
import variables from "../../../utils/variables";
import "./index.scss";

const Deposit = ({
  lang,
  chain,
  address,
  refreshBalance,
  setBalanceRefresh,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sourceAddress, setSourceAddress] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [amount, setAmount] = useState();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [proofHeight, setProofHeight] = useState(0);
  const [validationError, setValidationError] = useState();
  const [balanceInProgress, setBalanceInProgress] = useState(false);

  const onChange = (value) => {
    value = toDecimals(value).toString().trim();

    setAmount(value);
    setValidationError(
      ValidateInputNumber(getAmount(value), availableBalance?.amount)
    );
  };

  const showModal = () => {
    initializeIBCChain(chain.chainInfo, (error, account) => {
      if (error) {
        message.error(error);
        setInProgress(false);
        return;
      }

      setSourceAddress(account?.address);
      setBalanceInProgress(true);

      queryBalance(
        chain?.chainInfo?.rpc,
        account?.address,
        chain?.denom,
        (error, result) => {
          setBalanceInProgress(false);

          if (error) return;

          setAvailableBalance(result?.balance);
        }
      );

      fetchProofHeight(comdex?.rest, chain.sourceChannelId, (error, data) => {
        if (error) return;

        setProofHeight(data);
      });
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
          source_channel: chain.destChannelId,
          token: {
            denom: chain.denom,
            amount: getAmount(amount),
          },
          sender: sourceAddress,
          receiver: address,
          timeout_height: {
            revisionNumber: Number(proofHeight.revision_number),
            revisionHeight: Number(proofHeight.revision_height) + 100,
            // Need to add some blocks in order to get the timeout
          },
          timeout_timestamp: undefined,
        },
      },
      fee: { amount: [{ denom: chain.denom, amount: "25000" }], gas: "200000" },
      memo: "",
    };

    aminoSignIBCTx(chain.chainInfo, data, (error, result) => {
      setInProgress(false);
      if (error) {
        message.error(
          <Snack
            message={variables[lang].tx_failed}
            explorerUrlToTx={chain.chainInfo.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        );
        return;
      }

      message.success(
        <Snack
          message={variables[lang].tx_success}
          explorerUrlToTx={chain.chainInfo.explorerUrlToTx}
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
        {variables[lang].deposit}
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
        title="IBC Deposit"
      >
        <Form layout="vertical">
          <Row>
            <Col>
              <Form.Item label="From">
                <CustomInput
                  type="text"
                  value={truncateString(sourceAddress, 9, 9)}
                  disabled
                />
              </Form.Item>
            </Col>
            <SvgIcon name="arrow-right" viewbox="0 0 17.04 15.13" />
            <Col>
              <Form.Item label="To">
                <CustomInput
                  type="text"
                  value={truncateString(address, 9, 9)}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className="position-relative mt-3">
              <div className="availabe-balance">
                {balanceInProgress ? (
                  <Spin />
                ) : (
                  <>
                    {variables[lang].available}
                    <span className="ml-1">
                      {(availableBalance &&
                        availableBalance.amount &&
                        amountConversion(availableBalance.amount)) ||
                        0}{" "}
                      {(chain.currency &&
                        chain.currency.coinDenom &&
                        denomConversion(chain.currency.coinDenom)) ||
                        ""}
                    </span>
                    <span className="assets-maxhalf">
                      <Button
                        className=" active"
                        onClick={() => {
                          setAmount(
                            availableBalance?.amount > DEFAULT_FEE
                              ? amountConversion(
                                  availableBalance?.amount - DEFAULT_FEE
                                )
                              : amountConversion(availableBalance?.amount)
                          );
                        }}
                      >
                        {variables[lang].max}
                      </Button>
                    </span>
                  </>
                )}
              </div>
              <Form.Item label="Amount to Deposit" className="assets-input-box">
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
                className="btn-filled modal-btn"
                onClick={signIBCTx}
              >
                {variables[lang].deposit}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

Deposit.propTypes = {
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

export default connect(stateToProps, actionsToProps)(Deposit);
