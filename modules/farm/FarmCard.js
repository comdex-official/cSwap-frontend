import * as PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { Icon } from "../../shared/image/Icon"
import { NextImage } from "../../shared/image/NextImage"
import { useState } from "react"
import styles from "./Farm.module.scss"
import { ATOM, CMDS, Cup, Current, Pyramid, Ranged } from "../../shared/image"
import dynamic from "next/dynamic"
import { Modal } from "antd"
import Liquidity from "./Liquidity"
import Card from "../../shared/components/card/Card"
import { setUserLiquidityInPools } from "../../actions/liquidity";
import { DOLLAR_DECIMALS, PRICE_DECIMALS } from "../../constants/common";
import { amountConversion } from "../../utils/coin";
import { marketPrice } from "../../utils/number";

// const Card = dynamic(() => import("@/shared/components/card/Card"))

const FarmCard = ({
  theme,
  displayPools,
  lang,
  pool,
  markets,
  setUserLiquidityInPools,
  userLiquidityInPools,
  address,
  balances,
  rewardsMap,
  parent,
  assetMap,
}) => {
  const [showMoreData, setshowMoreData] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const calculatePoolLiquidity = useCallback(
    (poolBalance) => {
      if (poolBalance && Object.values(poolBalance)?.length) {
        const values = Object.values(poolBalance).map(
          (item) =>
            Number(
              amountConversion(item?.amount, assetMap[item?.denom]?.decimals)
            ) * marketPrice(markets, item?.denom)
        );
        return values?.reduce((prev, next) => prev + next, 0); // returning sum value
      } else return 0;
    },
    [markets, assetMap]
  );


  return (
    <div
      className={`${styles.farmCard__wrap} ${theme === "dark" ? styles.dark : styles.light
        }`}
    >
      <Card>
        <div
          className={`${styles.farmCard__main} ${theme === "dark" ? styles.dark : styles.light
            }`}
        >
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__left} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__wrap} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__left__logo} ${styles.first
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  <div
                    className={`${styles.farmCard__element__left__logo__main} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    <NextImage src={CMDS} alt="" />
                  </div>
                </div>
                <div
                  className={`${styles.farmCard__element__left__logo} ${styles.last
                    } ${theme === "dark" ? styles.dark : styles.light}`}
                >
                  <div
                    className={`${styles.farmCard__element__left__logo__main} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    <NextImage src={ATOM} alt="" />
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farmCard__element__left__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"CMDX-ATOM"}
              </div>
              <div
                className={`${styles.farmCard__element__left__description} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"Pool #03"}
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__right} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__right__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__right__basic} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.farmCard__element__right__basic__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    {"Basic"}
                  </div>
                  {false && (
                    <div
                      className={`${styles.farmCard__element__right__ranged__title
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Ranged} alt="Pool" />
                      {"Ranged"}
                    </div>
                  )}
                </div>
                <div
                  className={`${styles.farmCard__element__right__pool} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.farmCard__element__right__pool__title
                      } ${theme === "dark" ? styles.dark : styles.light}`}
                  >
                    <NextImage src={Pyramid} alt="Logo" />
                    {"Master Pool"}
                  </div>

                  {false && (
                    <div
                      className={`${styles.farmCard__element__right__pool__title
                        } ${theme === "dark" ? styles.dark : styles.light}`}
                    >
                      <NextImage src={Current} alt="Logo" />
                      {"MP Boost"}
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`${styles.farmCard__element__right__incentive} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__right__pool__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <NextImage src={Cup} alt="Logo" />
                  {"External Incentives"}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"APR"}
            </div>
            <div
              className={`${styles.farmCard__element__right__details} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__right__details__title
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"14.45%"}
                <Icon className={"bi bi-arrow-right"} />
              </div>
              <div
                className={`${styles.farmCard__element__right__pool} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__element__right__pool__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <NextImage src={Current} alt="Logo" />
                  {"Upto 54.45%"}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__left__title2} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"Total Liquidity"}
            </div>
            <div
              className={`${styles.farmCard__element__right__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"$117,402,993"}
            </div>
          </div>
          <div
            className={`${styles.farmCard__element} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <div
              className={`${styles.farmCard__element__boost__left} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__element__boost__left__title} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                {"MP Boost"}
              </div>
              <div
                className={`${styles.farmCard__element__boost__left__description
                  } ${theme === "dark" ? styles.dark : styles.light}`}
              >
                {"Upto +40%"}
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__boost__right} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {"Go to Pool"}
            </div>
          </div>

          <div
            className={`${styles.farmCard__buttonWrap} ${theme === "dark" ? styles.dark : styles.light
              }`}
          >
            <button onClick={() => showModal()}>Add Liquidity</button>
          </div>

          <div
            className={`${styles.farmCard__details} ${theme === "dark" ? styles.dark : styles.light
              }`}
            onClick={() => setshowMoreData(!showMoreData)}
          >
            <div
              className={`${styles.farmCard__details__title} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              {showMoreData ? "Hide Details" : "Show Details"}
            </div>

            {showMoreData ? (
              <Icon className={"bi bi-chevron-up"} size={"1.2rem"} />
            ) : (
              <Icon className={"bi bi-chevron-down"} size={"1.2rem"} />
            )}
          </div>

          {showMoreData && (
            <div
              className={`${styles.farmCard__footer__wrap} ${theme === "dark" ? styles.dark : styles.light
                }`}
            >
              <div
                className={`${styles.farmCard__footer__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"Estimated rewards earned per day"}
                </div>
                <div
                  className={`${styles.farmCard__footer__rewards} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  <div
                    className={`${styles.farmCard__footer__rewards__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    <NextImage src={ATOM} alt="" /> {"0.000000"}
                  </div>
                  <div
                    className={`${styles.farmCard__footer__rewards__title} ${theme === "dark" ? styles.dark : styles.light
                      }`}
                  >
                    <NextImage src={CMDS} alt="" /> {"0.000000"}
                  </div>
                </div>
              </div>
              <div
                className={`${styles.farmCard__footer__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"CMDX/CMST LP Farmed"}
                </div>
                <div
                  className={`${styles.farmCard__footer__right__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"$50.000"}
                </div>
              </div>
              <div
                className={`${styles.farmCard__footer__main} ${theme === "dark" ? styles.dark : styles.light
                  }`}
              >
                <div
                  className={`${styles.farmCard__footer__left__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {"CMDX/ATOM LP Farmed (Master Pool)"}
                </div>
                <div
                  className={`${styles.farmCard__footer__right__title} ${theme === "dark" ? styles.dark : styles.light
                    }`}
                >
                  {" "}
                  {"$150.000"}
                </div>
              </div>
            </div>
          )}

          <Modal
            className={"modal__wrap"}
            title="Liquidity"
            open={isModalOpen}
            onCancel={handleCancel}
          >
            <Liquidity theme={theme} />
          </Modal>
        </div>
      </Card>
    </div>
  )
}

FarmCard.propTypes = {
  setUserLiquidityInPools: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  lang: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  parent: PropTypes.string,
  pool: PropTypes.shape({
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
    reserveAccountAddress: PropTypes.string,
    poolCoinDenom: PropTypes.string,
    reserveCoinDenoms: PropTypes.array,
  }),
  poolIndex: PropTypes.number,
  rewardsMap: PropTypes.object,
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    markets: state.oracle.market.list,
    rewardsMap: state.liquidity.rewardsMap,
    lang: state.language,
    balances: state.account.balances.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    assetMap: state.asset.map,
  };
};

const actionsToProps = {
  setUserLiquidityInPools,
};

export default connect(stateToProps, actionsToProps)(FarmCard);