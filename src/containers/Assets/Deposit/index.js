import { Button, Form, message, Modal, Spin } from "antd";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
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
import { fetchTxHash } from "../../../services/transaction";
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
  handleRefresh,
  balances,
  assetMap,
}) => {
  const [isOpen, setIsModalOpen] = useState(false);
  const [sourceAddress, setSourceAddress] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [amount, setAmount] = useState();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [proofHeight, setProofHeight] = useState(0);
  const [validationError, setValidationError] = useState();
  const [balanceInProgress, setBalanceInProgress] = useState(false);

  const onChange = (value) => {
    value = toDecimals(value, assetMap[chain?.coinMinimalDenom]?.decimals)
      .toString()
      .trim();

    setAmount(value);
    setValidationError(
      ValidateInputNumber(getAmount(value), availableBalance?.amount)
    );
  };

  const initialize = useCallback(() => {
    initializeIBCChain(chain.chainInfo, (error, account) => {
      if (error) {
        setInProgress(false);
        return;
      }

      setSourceAddress(account?.address);
      setBalanceInProgress(true);

      queryBalance(
        chain?.chainInfo?.rpc,
        account?.address,
        chain?.coinMinimalDenom,
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
  }, [chain?.chainInfo, chain?.coinMinimalDenom, chain?.sourceChannelId]);

  useEffect(() => {
    if (isOpen) {
      initialize();
    }
  }, [address, initialize, isOpen]);

  const showModal = () => {
    initialize();
    setIsModalOpen(true);
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
            denom: chain?.coinMinimalDenom,
            amount: getAmount(
              amount,
              assetMap[chain?.coinMinimalDenom]?.decimals
            ),
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
      if (error) {
        if (result?.transactionHash) {
          message.error(
            <Snack
              message={variables[lang].tx_failed}
              explorerUrlToTx={chain?.explorerUrlToTx}
              hash={result?.transactionHash}
            />
          );
        } else {
          message.error(error);
        }

        resetValues();
        return;
      }

      if (result?.transactionHash) {
        message.loading(
          "Transaction Broadcasting, Waiting for transaction to be included in the block"
        );

        handleHash(result?.transactionHash);
      }
    });
  };

  const resetValues = () => {
    setInProgress(false);
    setIsModalOpen(false);
    setAmount();
  };

  const handleHash = (txhash) => {
    let counter = 0;

    const time = setInterval(() => {
      fetchTxHash(txhash, (hashResult) => {
        if (hashResult) {
          if (hashResult?.code !== undefined && hashResult?.code !== 0) {
            message.error(
              <Snack
                message={hashResult?.raw_log}
                explorerUrlToTx={chain?.explorerUrlToTx}
                hash={hashResult?.hash}
              />
            );

            resetValues();
            clearInterval(time);

            return;
          }
        }

        counter++;
        if (counter === 3) {
          if (
            hashResult &&
            hashResult.code !== undefined &&
            hashResult.code !== 0
          ) {
            message.error(
              <Snack
                message={hashResult?.raw_log}
                explorerUrlToTx={chain?.explorerUrlToTx}
                hash={hashResult?.hash}
              />
            );

            resetValues();
            clearInterval(time);

            return;
          }

          message.success(
            <Snack
              message={"Transaction Successful. Token Transfer in progress."}
              explorerUrlToTx={chain?.explorerUrlToTx}
              hash={txhash}
            />
          );

          resetValues();
          clearInterval(time);

          const fetchTime = setInterval(() => {
            queryBalance(
              comdex?.rpc,
              address,
              chain?.ibcDenomHash,
              (error, result) => {
                if (error) return;

                let resultBalance =
                  balances?.length &&
                  chain?.ibcDenomHash &&
                  balances.find((val) => val.denom === chain?.ibcDenomHash);

                if (result?.balance?.amount !== resultBalance?.amount) {
                  handleRefresh();
                  resetValues();

                  message.success("IBC Transfer Complete");

                  clearInterval(fetchTime);
                }
              }
            );
          }, 5000);
        }
      });
    }, 5000);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
        open={isOpen}
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
                        amountConversion(
                          availableBalance.amount,
                          assetMap[chain?.ibcDenomHash]?.decimals
                        )) ||
                        0}{" "}
                      {denomConversion(chain?.coinMinimalDenom || "")}
                    </span>
                    <span className="assets-maxhalf">
                      <Button
                        className=" active"
                        onClick={() => {
                          setAmount(
                            availableBalance?.amount > DEFAULT_FEE
                              ? amountConversion(
                                  availableBalance?.amount - DEFAULT_FEE,
                                  assetMap[chain?.ibcDenomHash]?.decimals
                                )
                              : amountConversion(
                                  availableBalance?.amount,
                                  assetMap[chain?.ibcDenomHash]?.decimals
                                )
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
                  inProgress ||
                  balanceInProgress ||
                  !Number(amount) ||
                  validationError?.message
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
  handleRefresh: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  chain: PropTypes.any,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
    assetMap: state.asset.map,
  };
};

export default connect(stateToProps)(Deposit);
