import { useRouter } from 'next/router';
import { Button, Tooltip, message } from 'antd';
import Copy from '../../shared/components/Copy';
import VoteNowModal from './VoteNowModal';
import * as PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Progress } from '@mantine/core';
import {
  setProposal,
  setProposalTally,
  setProposer,
  setTab,
} from '../../actions/govern';
import { comdex } from '../../config/network';
import { DOLLAR_DECIMALS } from '../../constants/common';
import {
  fetchRestBondexTokens,
  fetchRestProposal,
  fetchRestProposalTally,
  fetchRestProposer,
  fetchRestTallyParamsProposer,
  fetchRestVotingPower,
  queryUserVote,
} from '../../services/govern/query';
import {
  amountConversion,
  denomConversion,
  fixedDecimal,
} from '../../utils/coin';
import { formatTime } from '../../utils/date';
import { formatNumber } from '../../utils/number';
import {
  getLastWord,
  proposalOptionMap,
  stringTagParser,
  truncateString,
} from '../../utils/string';
import moment from 'moment';
import Loading from '../../pages/Loading';
import { NextImage } from '../../shared/image/NextImage';
import { Hyperlink } from '../../shared/image';

const GovernViewPage = ({
  address,
  setProposal,
  proposalMap,
  setProposer,
  setTab,
  proposerMap,
  setProposalTally,
  proposalTallyMap,
  assetMap,
}) => {
  const router = useRouter();
  const { id } = router.query;

  const [tallyParams, setTallyParams] = useState();
  const [bondedTokens, setBondedTokens] = useState();
  const [votingPower, setVotingPower] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [votedOption, setVotedOption] = useState();
  const [getVotes, setGetVotes] = useState({
    yes: 0,
    no: 0,
    veto: 0,
    abstain: 0,
  });

  let proposal = proposalMap?.[id];
  let proposer = proposerMap?.[id];
  let proposalTally = proposalTallyMap?.[id];

  const fetchTallyParamsProposer = useCallback(() => {
    setInProgress(true);
    fetchRestTallyParamsProposer((error, result) => {
      setInProgress(false);
      if (error) {
        // message.error(error);
        console.log(error);
        return;
      }
      setTallyParams(result);
    });
  }, []);

  const fetchVotingPower = useCallback(
    (address) => {
      fetchRestVotingPower(address, (error, result) => {
        if (error) {
          // message.error(error);
          console.log(error);
          return;
        }
        setVotingPower(result);
      });
    },
    [address]
  );

  const fetchBondexTokens = useCallback(() => {
    setInProgress(true);
    fetchRestBondexTokens((error, result) => {
      setInProgress(false);
      if (error) {
        // message.error(error);
        console.log(error);
        return;
      }
      setBondedTokens(result);
    });
  }, []);

  const calculateQuoremThreshold = () => {
    let bondedToken = bondedTokens?.pool?.bonded_tokens;
    let quorem = tallyParams?.tally_params?.quorum;
    let calculateQuoremThreshold = bondedToken * quorem;
    calculateQuoremThreshold = formatNumber(
      amountConversion(calculateQuoremThreshold || 0)
    );
    return calculateQuoremThreshold;
  };

  const calculateCurrentThreshold = () => {
    let yes = Number(proposalTally?.yes);
    let no = Number(proposalTally?.no);
    let veto = Number(proposalTally?.no_with_veto);
    let abstain = Number(proposalTally?.abstain);

    let totalValue = yes + no + abstain + veto;

    let bondedToken = bondedTokens?.pool?.bonded_tokens;
    let quorem = tallyParams?.tally_params?.quorum;
    let calculateQuoremThreshold = bondedToken * quorem;

    totalValue = amountConversion(totalValue || 0);
    calculateQuoremThreshold = amountConversion(calculateQuoremThreshold || 0);

    let calculateCurrentThresholdData =
      (Number(totalValue) / Number(calculateQuoremThreshold)) * 100;
    if (
      isNaN(calculateCurrentThresholdData) ||
      calculateCurrentThresholdData == 'Infinity'
    ) {
      return 0;
    }
    if (Number(calculateCurrentThresholdData) > 100) {
      calculateCurrentThresholdData = 100;
    }
    return fixedDecimal(calculateCurrentThresholdData || 0);
  };

  useEffect(() => {
    fetchTallyParamsProposer();
    fetchBondexTokens();
  }, []);

  useEffect(() => {
    if (address) {
      fetchVotingPower(address);
    }
  }, [address]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setInProgress(true);
    if (id) {
      fetchRestProposal(id, (error, result) => {
        if (error) {
          return;
        }

        setInProgress(false);
        setProposal(result?.proposal);
      });
      fetchRestProposalTally(id, (error, result) => {
        if (error) {
          return;
        }

        setProposalTally(result?.tally, id);
      });

      fetchRestProposer(id, (error, result) => {
        if (error) {
          return;
        }

        if (result?.tx_responses?.[0]?.tx?.body?.messages?.[0]?.proposer) {
          setProposer(
            result?.tx_responses?.[0]?.tx?.body?.messages?.[0]?.proposer,
            id
          );
        }
      });
    }
  }, [id, setProposal, setProposer, setProposalTally]);

  const fetchVote = useCallback(() => {
    queryUserVote(address, proposal?.id, (error, result) => {
      if (error) {
        return;
      }

      setVotedOption(
        result?.vote?.options[result?.vote?.options.length - 1]?.option
      );
    });
  }, [address, proposal?.id]);

  useEffect(() => {
    if (proposal?.id) {
      fetchVote();
    }
  }, [address, id, proposal, fetchVote]);

  const calculateTotalValue = () => {
    let yes = Number(proposalTally?.yes);
    let no = Number(proposalTally?.no);
    let veto = Number(proposalTally?.no_with_veto);
    let abstain = Number(proposalTally?.abstain);

    let totalValue = yes + no + abstain + veto;

    totalValue = totalValue / 1000000;
    totalValue = formatNumber(totalValue);
    return totalValue;
  };

  const calculateVotes = useCallback(() => {
    let yes = Number(proposalTally?.yes);
    let no = Number(proposalTally?.no);
    let veto = Number(proposalTally?.no_with_veto);
    let abstain = Number(proposalTally?.abstain);
    let totalValue = yes + no + abstain + veto;

    yes = Number((yes / totalValue || 0) * 100).toFixed(DOLLAR_DECIMALS);
    no = Number((no / totalValue || 0) * 100).toFixed(DOLLAR_DECIMALS);
    veto = Number((veto / totalValue || 0) * 100).toFixed(DOLLAR_DECIMALS);
    abstain = Number((abstain / totalValue || 0) * 100).toFixed(
      DOLLAR_DECIMALS
    );

    setGetVotes({
      ...getVotes,
      yes: yes || 0,
      no: no || 0,
      veto: veto || 0,
      abstain: abstain || 0,
    });
  }, [proposalTally]);

  useEffect(() => {
    if (proposalTally?.yes) {
      calculateVotes();
    }
  }, [proposalTallyMap, calculateVotes, proposalTally?.yes]);

  if (inProgress) {
    return (
      <div className="no_data">
        <Loading />
      </div>
    );
  }

  const handleClick = () => {
    router.push('/govern');
    setTab('2');
  };

  const totalAmount = votingPower?.delegation_responses.reduce(
    (sum, response) => {
      const amountInToken = amountConversion(
        response?.balance?.amount,
        assetMap[response?.balance?.denom]?.decimals
      );
      const amount = parseInt(amountInToken);
      return sum + amount;
    },
    0
  );

  return (
    <>
      <div className="proposal_view_back_button_container">
        <Button
          type="primary"
          className="btn-filled"
          onClick={() => handleClick()}
        >
          Back
        </Button>
      </div>

      <div className="govern_view_main_container">
        <div className="govern_view_container">
          <div className="proposal_detail_main_container">
            <div className="proposal_detail_container">
              <div className="proposal_id"> #{proposal?.id || '-'}</div>
              <div className="proposal_title">
                {proposal?.messages[0]?.content?.title
                  ? proposal?.messages[0]?.content?.title
                  : proposal?.messages[0]?.['@type']
                  ? getLastWord(proposal?.messages[0]?.['@type'])
                  : '------'}
              </div>
              <div className="proposal_overview_container">
                <div className="proposal_stats_container">
                  <div className="title">Voting Starts</div>
                  <div className="value">
                    {proposal?.voting_start_time
                      ? moment(proposal?.voting_start_time).format('DD-MM-YYYY')
                      : '--/--/--'}
                  </div>
                </div>
                <div className="proposal_stats_container">
                  <div className="title">Voting Ends</div>
                  <div className="value">
                    {proposal?.voting_end_time
                      ? moment(proposal?.voting_end_time).format('DD-MM-YYYY')
                      : '--/--/--'}
                  </div>
                </div>
                <div className="proposal_stats_container ">
                  <div className="title">Proposer</div>
                  <div className="value active">
                    {proposer ? (
                      <a
                        href={`https://www.mintscan.io/comdex/account/${proposer?.toUpperCase()}
              
                  `}
                        rel="noreferrer"
                        target="_blank"
                        aria-label="explorer"
                      >
                        {truncateString(proposer, 6, 6)}
                        <NextImage
                          src={Hyperlink}
                          alt={'HyperLink'}
                          height={20}
                          weight={20}
                        />
                      </a>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
                <div className="proposal_stats_container">
                  <div className="title">My Voting power</div>
                  <div className="value">
                    {address ? `${Number(totalAmount).toFixed(2)} CMDX` : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="proposal_vote_details_main_container">
            <div className="proposal_vote_details_container">
              <div className="title_and_user_vote_container">
                <div className="vote_title">Vote Details</div>
                <div className="user_vote">
                  {' '}
                  {proposalOptionMap?.[votedOption] && (
                    <span>
                      Your Vote : <span> {proposalOptionMap[votedOption]}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="proposal_vote_details_main">
                <div className="proposal_vote_column">
                  <div className="total_votel_container">
                    <div className="title">Total Votes</div>
                    <div className="value">
                      <div>
                        {`${calculateTotalValue() || '0'} ${denomConversion(
                          comdex?.coinMinimalDenom
                        )}`}
                      </div>
                    </div>
                  </div>

                  <div className="proposal_quorem_container">
                    <div className="total_quorem">
                      <div className="title">Current Quorum</div>
                      <Tooltip
                        title={'Min Quorum threshold: 33%.'}
                        placement="top"
                      >
                        <div
                          className={
                            calculateCurrentThreshold() < 100
                              ? 'value error-color'
                              : 'value green-color'
                          }
                        >
                          {' '}
                          {calculateCurrentThreshold() || 0} %
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className="proposal_vote_detail_column">
                  <div className="proposal_vote_up_row">
                    <div className="stata_main_container">
                      <div className="stats_container">
                        <div
                          className="color"
                          style={{ backgroundColor: '#52B788' }}
                        ></div>
                        <div className="data_container">
                          <div className="title">Yes</div>
                          <div className="value">
                            {' '}
                            {Number(getVotes?.yes || '0.00')}%
                          </div>
                        </div>
                      </div>
                      <div className="stats_container">
                        <div
                          className="color"
                          style={{ backgroundColor: '#D74A4A' }}
                        ></div>
                        <div className="data_container">
                          <div className="title">No</div>
                          <div className="value">
                            {' '}
                            {Number(getVotes?.no || '0.00')}%
                          </div>
                        </div>
                      </div>
                      <div className="stats_container">
                        <div
                          className="color"
                          style={{ backgroundColor: '#C2A3A3' }}
                        ></div>
                        <div className="data_container">
                          <div className="title">No With Veto</div>
                          <div className="value">
                            {Number(getVotes?.veto || '0.00')}%
                          </div>
                        </div>
                      </div>
                      <div className="stats_container">
                        <div
                          className="color"
                          style={{ backgroundColor: '#9FA4AD' }}
                        ></div>
                        <div className="data_container">
                          <div className="title">Abstain</div>
                          <div className="value">
                            {Number(getVotes?.abstain || '0.00')}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="proposal_vote_botom_row">
                    <div className="mt-3 mask_container_relative">
                      <div>
                        <Progress
                          className="vote-progress-bar"
                          radius="xl"
                          size={10}
                          sections={[
                            {
                              value: Number(getVotes?.yes || 0),
                              color: '#52B788',
                              tooltip: `Yes ${Number(getVotes?.yes || 0)} %`,
                            },
                            {
                              value: Number(getVotes?.no || 0),
                              color: '#D74A4A',
                              tooltip: `No ${Number(getVotes?.no || 0)} %`,
                            },
                            {
                              value: Number(getVotes?.veto || 0),
                              color: '#C2A3A3',

                              tooltip: `No With Veto ${Number(
                                getVotes?.veto || 0
                              )} %`,
                            },
                            {
                              value: Number(getVotes?.abstain || 0),
                              color: '#9FA4AD',

                              tooltip: `Abstain ${Number(
                                getVotes?.abstain || 0
                              )} %`,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="proposal_vote_btn_container">
                  <VoteNowModal refreshVote={fetchVote} proposal={proposal} />
                </div>
              </div>
            </div>
          </div>

          <div className="proposal_description_main_container">
            <div className="proposal_heading">Description</div>
            <div className="proposal_para">
              {proposal?.messages[0]?.content?.description
                ? stringTagParser(proposal?.messages[0]?.content?.description)
                : proposal?.messages[0]?.['@type']
                ? getLastWord(proposal?.messages[0]?.['@type'])
                : ' '}
            </div>

            <div className="proposal_suggest_box">
              <p>No other parameters are being changed.</p>
              <p>
                {' '}
                Vote <span>Yes</span> to approve the increase of debt ceiling.
              </p>
              <p>
                {' '}
                Vote <span>No</span> to disapprove the increase of debt ceiling.
              </p>
              <p>
                {' '}
                Vote <span>No With Veto</span> expresses that you strongly
                disagree and would like to see depositors penalised by
                revocation of their proposal deposit.
              </p>
              <p>
                {' '}
                Vote <span>Abstain</span> to express no interest in the
                proposal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

GovernViewPage.propTypes = {
  lang: PropTypes.string.isRequired,
  setProposal: PropTypes.func.isRequired,
  setProposalTally: PropTypes.func.isRequired,
  setProposer: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
  proposalMap: PropTypes.object,
  proposalTallyMap: PropTypes.object,
  proposerMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    proposalMap: state.govern.proposalMap,
    proposerMap: state.govern.proposerMap,
    proposalTallyMap: state.govern.proposalTallyMap,
    assetMap: state.asset.map,
  };
};

const actionsToProps = {
  setProposal,
  setProposer,
  setTab,
  setProposalTally,
};

export default connect(stateToProps, actionsToProps)(GovernViewPage);
