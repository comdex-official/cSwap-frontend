import { message, Skeleton, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import uuid from 'react-uuid';
import { setPoolRewards } from '../../actions/liquidity';
import { DOLLAR_DECIMALS } from '../../constants/common';
import { fetchRestAPRs } from '../../services/liquidity/query';
import { commaSeparator, marketPrice } from '../../utils/number';
import { NextImage } from '../../shared/image/NextImage';
import styles from '../farm/Farm.module.scss';
import { Icon } from '../../shared/image/Icon';
import { Current } from '../../shared/image';
import { fixedDecimal } from '../../utils/coin';

const ShowAPR = ({
  pool,
  rewardsMap,
  setPoolRewards,
  iconList,
  markets,
  userLiquidityInPools,
  calculateVaultEmission,
  calculateExternalPoolApr,
  calculateExternalBasePoolApr,
  calculateAPY,
  getMasterPool,
}) => {
  const theme = 'dark';
  const [isFetchingAPR, setIsFetchingAPR] = useState(false);

  const maxRetries = 2;
  let retries = 0;

  const getAPRs = useCallback(() => {
    setIsFetchingAPR(true);
    fetchRestAPRs((error, result) => {
      setIsFetchingAPR(false);
      if (error) {
        retries++;
        console.log(error);
        if (retries < maxRetries) {
          getAPRs();
        }
      }
      if(result){
      setPoolRewards(result?.data);
      }
    });
  }, [setPoolRewards]);

  useEffect(() => {
    if (!rewardsMap?.[pool?.id?.toNumber()]) {
      getAPRs();
    }
  }, [getAPRs]); // not including other dependencies as its going infinite loop.

  const calculateMasterPoolApr = () => {
    const totalMasterPoolApr = rewardsMap?.[
      pool?.id?.toNumber()
    ]?.incentive_rewards.filter((reward) => reward.master_pool);

    return fixedDecimal(totalMasterPoolApr?.[0]?.apr);
  };

  const calculateChildPoolApr = () => {
    const totalApr = rewardsMap?.[pool?.id?.toNumber()]?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = rewardsMap?.[
      pool?.id?.toNumber()
    ]?.swap_fee_rewards.reduce((acc, reward) => acc + reward.apr, 0);
    const total = totalApr + swapFeeApr;

    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let _totalLiquidity = userLiquidityInPools[pool?.id];
    let harborQTY = calculateVaultEmission(Number(pool?.id));
    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(_totalLiquidity);

    return fixedDecimal(total + calculatedAPY);
  };

  const fetchMasterPoolAprData = () => {
    let totalMasterPoolApr = 0;
    // This will output the total APR value for all incentive_rewards where master_pool=true
    if (rewardsMap) {
      Object.values(rewardsMap && rewardsMap).forEach((value) => {
        const incentiveRewards = value.incentive_rewards;

        incentiveRewards.forEach((incentive) => {
          if (incentive.master_pool === true) {
            totalMasterPoolApr += incentive.apr;
          }
        });
      });
    }
    return fixedDecimal(totalMasterPoolApr);
  };

  const calculateUptoApr = () => {
    let totalApr = 0;
    let totalMasterPoolApr = fetchMasterPoolAprData();

    // calculate apr in incentive_rewards
    rewardsMap?.[pool?.id?.toNumber()]?.incentive_rewards.forEach((reward) => {
      if (!reward.master_pool) {
        totalApr += reward.apr;
      }
    });

    // calculate apr in swap_fee_rewards
    rewardsMap?.[pool?.id?.toNumber()]?.swap_fee_rewards.forEach((reward) => {
      totalApr += reward.apr;
    });
    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let _totalLiquidity = userLiquidityInPools[pool?.id];
    let harborQTY = calculateVaultEmission(Number(pool?.id));
    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(_totalLiquidity);

    let totalMasterPoolAprFinal =
      fixedDecimal(totalMasterPoolApr) +
      fixedDecimal(totalApr) +
      fixedDecimal(calculatedAPY);

    return fixedDecimal(totalMasterPoolAprFinal);
  };

  const showIndividualAPR = (list) => {
    if (list?.length > 2) {
      return (
        <>
          {Object.keys(list)?.map((key, index) => (
            <div key={uuid()}>
              {index < 2 ? (
                <Tooltip
                  title={
                    !list[key]?.master_pool ? (
                      <>
                        <div className="upto_apr_tooltip_farm_main_container">
                          <div className="upto_apr_tooltip_farm active">
                            <span className="text">
                              Total APR (incl. MP Rewards):
                            </span>
                            <span className="value">
                              {' '}
                              {commaSeparator(calculateUptoApr() || 0)}%
                            </span>
                          </div>

                          <div className="upto_apr_tooltip_farm active">
                            <span className="text">
                              Base APR ({' '}
                              <NextImage
                                src={iconList?.['ucmdx']?.coinImageUrl}
                                alt={'logo'}
                                height={15}
                                width={15}
                              />{' '}
                              CMDX yield only):
                            </span>
                            <span className="value">
                              {' '}
                              {list[key]?.master_pool ? (
                                commaSeparator(calculateMasterPoolApr()) || 0
                              ) : calculateExternalBasePoolApr(Number(pool?.id))
                                  ?.length > 0 ? (
                                calculateExternalBasePoolApr(
                                  Number(pool?.id)
                                ).map((item) => (
                                  <span className="value">
                                    {commaSeparator(
                                      fixedDecimal(item?.apr) || 0
                                    )}
                                    %
                                  </span>
                                ))
                              ) : (
                                <span className="value">0%</span>
                              )}
                            </span>
                          </div>

                          {calculateExternalPoolApr(Number(pool?.id))?.length >
                            0 && (
                            <div className="upto_apr_tooltip_farm active">
                              <span className="text">External APR:</span>
                              <span className="value">
                                <div className="eApr">
                                  {calculateExternalPoolApr(
                                    Number(pool?.id)
                                  ).map((item) => (
                                    <>
                                      <NextImage
                                        src={
                                          iconList?.[item?.denom]?.coinImageUrl
                                        }
                                        alt={'logo'}
                                        height={15}
                                        width={15}
                                      />
                                      {commaSeparator(
                                        fixedDecimal(item?.apr) || 0
                                      )}
                                      %
                                    </>
                                  ))}
                                </div>
                              </span>
                            </div>
                          )}

                          {calculateAPY(
                            userLiquidityInPools[pool?.id],
                            Number(pool?.id)
                          ) ? (
                            <div className="upto_apr_tooltip_farm active">
                              <span className="text">Emission APY:</span>

                              <span className="value">
                                {calculateAPY(
                                  userLiquidityInPools[pool?.id],
                                  Number(pool?.id)
                                )
                                  ? calculateAPY(
                                      userLiquidityInPools[pool?.id],
                                      Number(pool?.id)
                                    ) + '%'
                                  : null}
                              </span>
                            </div>
                          ) : (
                            ''
                          )}

                          <div className="upto_apr_tooltip_farm active">
                            <span className="text">Swap Fee APR :</span>
                            <span className="value">
                              {' '}
                              {fixedDecimal(
                                rewardsMap?.swap_fee_rewards?.[0]?.apr || 0
                              )}
                              %
                            </span>
                          </div>

                          <div className="upto_apr_tooltip_farm">
                            <span className="text">Available MP Boost:</span>
                            <span className="value">
                              {' '}
                              Upto{' '}
                              {commaSeparator(fetchMasterPoolAprData() || 0)}%
                              for providing liquidity in the Master Pool
                            </span>
                          </div>
                        </div>
                      </>
                    ) : null
                  }
                  overlayClassName="farm_upto_apr_tooltip"
                >
                  <div
                    className={`${styles.farmCard__element__right__details} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.farmCard__element__right__details__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {list[key]?.master_pool
                        ? ''
                        : `${commaSeparator(calculateChildPoolApr()) || 0}%`}

                      {!list[key]?.master_pool ? (
                        <Icon className={'bi bi-arrow-right'} />
                      ) : (
                        ''
                      )}
                    </div>
                    {!list[key]?.master_pool ? (
                      <div
                        className={`${styles.farmCard__element__right__pool} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        <div
                          className={`${
                            styles.farmCard__element__right__pool__title
                          } ${styles.boost} ${
                            theme === 'dark' ? styles.dark : styles.light
                          }`}
                        >
                          <NextImage src={Current} alt="Logo" />
                          {`Upto ${commaSeparator(calculateUptoApr() || 0)} %`}
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </Tooltip>
              ) : (
                ''
              )}
            </div>
          ))}

          <span className="comdex-tooltip ">
            <Tooltip
              overlayClassName=" farm-apr-modal "
              title={Object.keys(list)?.map((key) => (
                <div key={uuid()}>
                  <span className="ml-1">
                    <NextImage
                      src={iconList?.[list[key]?.denom]?.coinImageUrl}
                      width={30}
                      height={30}
                      alt=""
                    />{' '}
                    {list[key]?.master_pool ? 'Master Pool - ' : 'External - '}
                    {commaSeparator((Number(list[key]?.apr) || 0).toFixed())}%
                  </span>
                </div>
              ))}
            >
              <span className="view-all-farm-apr"> View All</span>
            </Tooltip>
          </span>
        </>
      );
    } else {
      return Object.keys(list)?.map((key) => (
        <div key={uuid()}>
          <Tooltip
            title={
              !list[key]?.master_pool ? (
                <>
                  <div className="upto_apr_tooltip_farm_main_container">
                    <div className="upto_apr_tooltip_farm">
                      <span className="text">
                        Total APR (incl. MP Rewards):
                      </span>
                      <span className="value">
                        {' '}
                        {commaSeparator(calculateUptoApr() || 0)}%
                      </span>
                    </div>

                    <div className="upto_apr_tooltip_farm">
                      <span className="text">
                        Base APR ({' '}
                        <NextImage
                          src={iconList?.['ucmdx']?.coinImageUrl}
                          alt={'logo'}
                          height={15}
                          width={15}
                        />{' '}
                        CMDX yield only):
                      </span>
                      <span className="value">
                        {' '}
                        {list[key]?.master_pool ? (
                          commaSeparator(calculateMasterPoolApr()) || 0
                        ) : calculateExternalBasePoolApr(Number(pool?.id))
                            ?.length > 0 ? (
                          calculateExternalBasePoolApr(Number(pool?.id)).map(
                            (item) => (
                              <span className="value">
                                {commaSeparator(fixedDecimal(item?.apr) || 0)}%
                              </span>
                            )
                          )
                        ) : (
                          <span className="value">0%</span>
                        )}
                      </span>
                    </div>

                    {calculateExternalPoolApr(Number(pool?.id))?.length > 0 && (
                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">External APR:</span>
                        <span className="value">
                          <div className="eApr">
                            {calculateExternalPoolApr(Number(pool?.id)).map(
                              (item) => (
                                <>
                                  <NextImage
                                    src={iconList?.[item?.denom]?.coinImageUrl}
                                    alt={'logo'}
                                    height={15}
                                    width={15}
                                  />
                                  {commaSeparator(fixedDecimal(item?.apr) || 0)}
                                  %
                                </>
                              )
                            )}
                          </div>
                        </span>
                      </div>
                    )}

                    {calculateAPY(
                      userLiquidityInPools[pool?.id],
                      Number(pool?.id)
                    ) ? (
                      <div className="upto_apr_tooltip_farm active">
                        <span className="text">Emission APY:</span>

                        <span className="value">
                          {calculateAPY(
                            userLiquidityInPools[pool?.id],
                            Number(pool?.id)
                          )
                            ? calculateAPY(
                                userLiquidityInPools[pool?.id],
                                Number(pool?.id)
                              ) + '%'
                            : null}
                        </span>
                      </div>
                    ) : (
                      ''
                    )}

                    <div className="upto_apr_tooltip_farm">
                      <span className="text">Swap Fee APR :</span>
                      <span className="value">
                        {' '}
                        {fixedDecimal(
                          rewardsMap?.swap_fee_rewards?.[0]?.apr || 0
                        )}
                        %
                      </span>
                    </div>

                    <div className="upto_apr_tooltip_farm">
                      <span className="text">Available MP Boost:</span>
                      <span className="value">
                        {' '}
                        Upto {commaSeparator(fetchMasterPoolAprData() || 0)}%
                        for providing liquidity in the Master Pool
                      </span>
                    </div>
                  </div>
                </>
              ) : null
            }
            overlayClassName="farm_upto_apr_tooltip"
          >
            <div
              className={`${styles.farmCard__element__right__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${
                  styles.farmCard__element__right__details__title
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {list[key]?.master_pool
                  ? ''
                  : `${commaSeparator(calculateChildPoolApr()) || 0}%`}

                {!list[key]?.master_pool ? (
                  <Icon className={'bi bi-arrow-right'} />
                ) : (
                  ''
                )}
              </div>
              {!list[key]?.master_pool ? (
                <div
                  className={`${styles.farmCard__element__right__pool} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.farmCard__element__right__pool__title
                    } ${styles.boost} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <NextImage src={Current} alt="Logo" />
                    {`Upto ${commaSeparator(calculateUptoApr() || 0)} %`}
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </Tooltip>
        </div>
      ));
    }
  };

  return (
    <>
      {isFetchingAPR && !rewardsMap?.[pool?.id?.toNumber()] ? (
        <Skeleton.Button
          className="apr-skeleton"
          active={true}
          size={'small'}
        />
      ) : Number(
          rewardsMap?.[pool?.id?.toNumber()]?.incentive_rewards[0]?.apr
        ) ? (
        showIndividualAPR(rewardsMap?.[pool?.id?.toNumber()]?.incentive_rewards)
      ) : (
        `${commaSeparator(Number(0).toFixed(DOLLAR_DECIMALS))}%`
      )}
    </>
  );
};

ShowAPR.propTypes = {
  setPoolRewards: PropTypes.func.isRequired,
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
  rewardsMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    rewardsMap: state.liquidity.rewardsMap,
    iconList: state.config?.iconList,
    markets: state.oracle.market.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
  };
};

const actionsToProps = {
  setPoolRewards,
};

export default connect(stateToProps, actionsToProps)(ShowAPR);
