import { Button, Col, Row, Table } from 'antd';
import * as PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setShowMyPool,
  setSelectedManagePool,
} from '../../actions/liquidity';
import {
  DOLLAR_DECIMALS,
  PRICE_DECIMALS,
  PRODUCT_ID,
} from '../../constants/common';
import {
  commaSeparator,
  decimalConversion,
  formatNumber,
  marketPrice,
} from '../../utils/number';
import ShowAPR from './ShowAPR';
import PoolCardRow from './MyPoolRow';
import { useRouter } from 'next/router';
import NoDataIcon from '../../shared/components/NoDataIcon';
import {
  amountConversion,
  denomConversion,
  fixedDecimal,
} from '../../utils/coin';
import {
  emissiondata,
  userProposalProjectedEmission,
  votingCurrentProposal,
  votingCurrentProposalId,
} from '../../services/liquidity/query';

const MyPools = ({
  pools,
  lang,
  userLiquidityInPools,
  setShowMyPool,
  setSelectedManagePool,
  rewardsMap,
  markets,
  address,
}) => {
  const navigate = useRouter();

  const rawUserPools = Object.keys(userLiquidityInPools)?.map((poolKey) =>
    pools?.find(
      (pool) =>
        pool?.id?.toNumber() === Number(poolKey) &&
        Number(userLiquidityInPools[poolKey]) > 0
    )
  );

  const getMasterPool = (_id) => {
    const hasMasterPool = rewardsMap?.[_id]?.incentive_rewards?.some(
      (pool) => pool.master_pool
    );
    return hasMasterPool;
  };

  const calculateMasterPoolApr = (_id) => {
    const totalMasterPoolApr = rewardsMap?.[_id]?.incentive_rewards.filter(
      (reward) => reward.master_pool
    );

    return fixedDecimal(totalMasterPoolApr?.[0]?.apr);
  };

  const calculateChildPoolApr = (_id) => {
    const totalApr = rewardsMap?.[_id]?.incentive_rewards
      .filter((reward) => !reward.master_pool)
      .reduce((acc, reward) => acc + reward.apr, 0);

    const swapFeeApr = rewardsMap?.[_id]?.swap_fee_rewards.reduce(
      (acc, reward) => acc + reward.apr,
      0
    );
    const total = totalApr + swapFeeApr;
    return fixedDecimal(total);
  };

  const calculateApr = (_id) => {
    getMasterPool(_id);
    if (getMasterPool(_id)) {
      return calculateMasterPoolApr(_id);
    } else {
      return calculateChildPoolApr(_id);
    }
  };

  const userPools = rawUserPools.filter((item) => item);

  const [userCurrentProposalData, setUserCurrentProposalData] = useState();
  const [currentProposalAllData, setCurrentProposalAllData] = useState();
  const [protectedEmission, setProtectedEmission] = useState(0);
  const [proposalId, setProposalId] = useState();

  useEffect(() => {
    fetchVotingCurrentProposalId();
  }, []);

  const fetchVotingCurrentProposalId = () => {
    votingCurrentProposalId(PRODUCT_ID)
      .then((res) => {
        setProposalId(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (proposalId) {
      fetchuserProposalProjectedEmission(proposalId);
      fetchVotingCurrentProposal(proposalId);
    }
  }, [address, proposalId]);

  useEffect(() => {
    if (address) {
      fetchEmissiondata(address);
    }
  }, [address]);

  const fetchuserProposalProjectedEmission = (proposalId) => {
    userProposalProjectedEmission(proposalId)
      .then((res) => {
        setProtectedEmission(amountConversion(res));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchVotingCurrentProposal = (proposalId) => {
    votingCurrentProposal(proposalId)
      .then((res) => {
        setCurrentProposalAllData(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchEmissiondata = (address) => {
    emissiondata(address, (error, result) => {
      if (error) {
        // message.error(error);
        console.log(error);
        return;
      }
      setUserCurrentProposalData(result?.data);
    });
  };

  const calculateVaultEmission = (id) => {
    let totalVoteOfPair = userCurrentProposalData?.filter(
      (item) => item?.pair_id === Number(id) + 1000000
    );

    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0;
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = protectedEmission;

    let calculatedEmission =
      (Number(totalVoteOfPair) / Number(totalWeight)) * projectedEmission;

    if (isNaN(calculatedEmission) || calculatedEmission === Infinity) {
      return 0;
    } else {
      return Number(calculatedEmission).toFixed(2);
    }
  };

  const calculateExternalPoolApr = (_id) => {
    const totalApr = rewardsMap?.[_id]?.incentive_rewards.filter(
      (reward) => reward?.master_pool !== true && reward?.denom !== 'ucmdx'
    );

    return totalApr;
  };

  const calculateExternalBasePoolApr = (_id) => {
    const totalApr = rewardsMap?.[_id]?.incentive_rewards.filter(
      (reward) => reward?.master_pool !== true && reward?.denom === 'ucmdx'
    );

    return totalApr;
  };

  const calculateAPY = (_totalLiquidity, _id) => {
    // *formula = (365 * ((Harbor qty / 7)* harbor price)) / total cmst minted
    // *harbor qty formula=(totalVoteOnIndivisualVault / TotalVoteOnAllVaults) * (TotalWeekEmission)

    let harborTokenPrice = marketPrice(markets, 'uharbor') || 0; //harborPrice;
    let totalMintedCMST = _totalLiquidity;
    let harborQTY = calculateVaultEmission(_id);

    let calculatedAPY =
      (365 * ((harborQTY / 7) * harborTokenPrice)) / Number(totalMintedCMST);

    if (
      isNaN(calculatedAPY) ||
      calculatedAPY === Infinity ||
      calculatedAPY === 0
    ) {
      return 0;
    } else {
      return Number(calculatedAPY).toFixed(DOLLAR_DECIMALS);
    }
  };

  const calculatePerDollorEmissioAmount = (_id, _totalLiquidity) => {
    let totalVoteOfPair = userCurrentProposalData?.filter(
      (item) => item?.pair_id === Number(_id) + 1000000
    );
    totalVoteOfPair = totalVoteOfPair?.[0]?.total_vote || 0;
    let totalWeight = currentProposalAllData?.total_voted_weight || 0;
    let projectedEmission = protectedEmission;
    let totalLiquidity = _totalLiquidity;
    let calculatedEmission =
      (Number(totalVoteOfPair) / Number(totalWeight)) * projectedEmission;
    let calculatePerDollorValue = calculatedEmission / Number(totalLiquidity);

    if (
      isNaN(calculatePerDollorValue) ||
      calculatePerDollorValue === Infinity
    ) {
      return '--';
    } else {
      return formatNumber(
        Number(calculatePerDollorValue).toFixed(DOLLAR_DECIMALS)
      );
    }
  };

  const columns = [
    {
      title: 'Asset Pair',
      dataIndex: 'assetpair',
      key: 'assetpair',
      align: 'center',
      width: 400,
      render: (pool) => (
        <PoolCardRow
          key={pool?.id}
          pool={pool}
          lang={lang}
          calculateAPY={calculateAPY}
          calculatePerDollorEmissioAmount={calculatePerDollorEmissioAmount}
          calculateVaultEmission={calculateVaultEmission}
          getMasterPool={getMasterPool}
        />
      ),
      sorter: (a, b) =>
        denomConversion(a?.assetpair?.balances?.baseCoin?.denom)?.localeCompare(
          denomConversion(b?.assetpair?.balances?.quoteCoin?.denom)
        ),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'APR',
      dataIndex: 'apr',
      key: 'apr',
      align: 'left',
      width: 250,
      render: (pool) => (
        <div className="farm-apr-modal portfolio-apr">
          <ShowAPR
            pool={pool}
            calculateVaultEmission={calculateVaultEmission}
            calculateExternalPoolApr={calculateExternalPoolApr}
            calculateExternalBasePoolApr={calculateExternalBasePoolApr}
            calculateAPY={calculateAPY}
            getMasterPool={getMasterPool}
          />
        </div>
      ),
      sorter: (a, b) =>
        Number(calculateApr(a?.apr?.id?.toNumber()) || 0) -
        Number(calculateApr(b?.apr?.id?.toNumber()) || 0),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: <>User Liquidity</>,
      dataIndex: 'position',
      key: 'position',
      width: 200,
      render: (position) => (
        <div>
          ${commaSeparator(Number(position || 0).toFixed(DOLLAR_DECIMALS))}
        </div>
      ),
      sorter: (a, b) => Number(a?.position || 0) - Number(b?.position || 0),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      align: 'right',
      width: 100,
      render: (item) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedManagePool(item);
            setShowMyPool(true);
            navigate.push(`/farm`);
          }}
          className="btn-filled2"
          size="small"
        >
          Manage
        </Button>
      ),
    },
  ];

  const tableData =
    userPools.length > 0 &&
    userPools.map((item, index) => {
      return {
        key: index,
        assetpair: item,
        position: userLiquidityInPools[item?.id],
        reward: item?.reward,
        apr: item,
        action: item,
      };
    });

  const handleClick = () => {
    navigate.push(`/farm`);
  };

  const tableClassName = (record) => {
    if (getMasterPool(Number(record?.apr?.id))) {
      return 'master__card'; // Custom CSS class for the highlighted row
    }

    if (record?.apr?.type === 2) {
      if (
        Number(decimalConversion(record?.apr?.price)).toFixed(PRICE_DECIMALS) >
          Number(decimalConversion(record?.apr?.minPrice)).toFixed(
            PRICE_DECIMALS
          ) &&
        Number(decimalConversion(record?.apr?.price)).toFixed(PRICE_DECIMALS) <
          Number(decimalConversion(record?.apr?.maxPrice)).toFixed(
            PRICE_DECIMALS
          )
      ) {
        return '';
      } else {
        return 'dim__card';
      }
    }
    return '';
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col style={{ width: '100%' }}>
          <Table
            className="custom-table farm-table"
            dataSource={tableData}
            columns={columns}
            pagination={false}
            rowClassName={tableClassName}
            scroll={{ x: '100%' }}
            locale={{
              emptyText: (
                <NoDataIcon
                  text="No Liquidity Provided"
                  button={true}
                  buttonText={'Go To Pools'}
                  OnClick={() => handleClick()}
                />
              ),
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

MyPools.propTypes = {
  lang: PropTypes.string.isRequired,
  setFirstReserveCoinDenom: PropTypes.func.isRequired,
  setSecondReserveCoinDenom: PropTypes.func.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
  pools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      reserveAccountAddress: PropTypes.string,
      poolCoinDenom: PropTypes.string,
      reserveCoinDenoms: PropTypes.array,
    })
  ),
  userLiquidityInPools: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    balances: state.account.balances.list,
    pools: state.liquidity.pool.list,
    markets: state.oracle.market.list,
    userLiquidityInPools: state.liquidity.userLiquidityInPools,
    rewardsMap: state.liquidity.rewardsMap,
    address: state.account.address,
  };
};

const actionsToProps = {
  setFirstReserveCoinDenom,
  setSecondReserveCoinDenom,
  setShowMyPool,
  setSelectedManagePool,
};

export default connect(stateToProps, actionsToProps)(MyPools);
