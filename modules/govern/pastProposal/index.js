import { useRouter } from 'next/router';
import * as PropTypes from 'prop-types';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { proposalStatusMap, stringTagParser } from '../../../utils/string';
import { DOLLAR_DECIMALS } from '../../../constants/common';
import { Progress } from '@mantine/core';

const GovernPastProposal = ({ proposals }) => {
  const router = useRouter();

  const calculateVotes = useCallback((value, final_tally_result) => {
    let yes = Number(final_tally_result?.yes);
    let no = Number(final_tally_result?.no);
    let veto = Number(final_tally_result?.no_with_veto);
    let abstain = Number(final_tally_result?.abstain);
    let totalValue = yes + no + abstain + veto;

    let result = Number((Number(value) / totalValue || 0) * 100).toFixed(
      DOLLAR_DECIMALS
    );

    return result;
  }, []);

  return (
    <>
      <div className={`mt-4 openProposal`}>
        <div className="govern_main_container">
          <div className="govern_container">
            <div className="govern_tab_main_container">
              <div className="govern_tab"></div>
              <div className="govern_search"></div>
            </div>

            <div className="proposal_box_parent_container">
              {proposals?.length > 0
                ? proposals?.map((item) => {
                    return (
                      <div
                        className="proposal_main_container"
                        key={item?.proposal_id}
                        onClick={() =>
                          router.push(`/governview/${item?.proposal_id}`)
                        }
                      >
                        <div className="proposal_container">
                          <div className="id_timer_container">
                            <div className="proposal_id">
                              #{item?.proposal_id}
                            </div>
                            <div className="proposal_timer">
                              <div className="proposal-status-container">
                                <div
                                  className={
                                    proposalStatusMap[item?.status] === 'Open'
                                      ? 'proposal-status open-color'
                                      : proposalStatusMap[item?.status] ===
                                          'Passed' ||
                                        proposalStatusMap[item?.status] ===
                                          'Executed'
                                      ? 'proposal-status passed-color'
                                      : proposalStatusMap[item?.status] ===
                                          'Rejected' ||
                                        proposalStatusMap[item?.status] ===
                                          'Failed'
                                      ? 'proposal-status reject-color'
                                      : proposalStatusMap[item?.status] ===
                                          'Pending' ||
                                        proposalStatusMap[item?.status] ===
                                          'Deposit Period'
                                      ? 'proposal-status pending-color'
                                      : 'proposal-status'
                                  }
                                >
                                  {' '}
                                  {item
                                    ? proposalStatusMap[item?.status]
                                    : '-' || '-'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="haeading_container">
                            <div className="heading">
                              {item?.content?.title}
                            </div>
                          </div>

                          <div className="para_main_container">
                            <div className="para_container">
                              {stringTagParser(
                                item?.content?.description.substring(0, 150) ||
                                  ' '
                              ) + '......'}{' '}
                            </div>
                          </div>

                          <div className="progress_bar_main_container">
                            <div className="progress_bar_container">
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
                                      {`${calculateVotes(
                                        item?.final_tally_result?.yes,
                                        item?.final_tally_result
                                      )}%`}
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
                                    <div className="value">{`${calculateVotes(
                                      item?.final_tally_result?.no,
                                      item?.final_tally_result
                                    )}%`}</div>
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
                                      {' '}
                                      {`${calculateVotes(
                                        item?.final_tally_result?.no_with_veto,
                                        item?.final_tally_result
                                      )}%`}
                                    </div>
                                  </div>
                                </div>
                                <div className="stats_container">
                                  <div
                                    className="color"
                                    style={{ backgroundColor: '#C58E3D' }}
                                  ></div>
                                  <div className="data_container">
                                    <div className="title">Abstain</div>
                                    <div className="value">
                                      {' '}
                                      {`${calculateVotes(
                                        item?.final_tally_result?.abstain,
                                        item?.final_tally_result
                                      )}%`}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="progress_bar">
                                <div className="mt-3">
                                  <div>
                                    <Progress
                                      className="vote-progress-bar"
                                      radius="xl"
                                      size={10}
                                      sections={[
                                        {
                                          value: Number(
                                            calculateVotes(
                                              item?.final_tally_result?.yes,
                                              item?.final_tally_result
                                            )
                                          ),
                                          color: '#52B788',
                                          tooltip: `Yes ${calculateVotes(
                                            item?.final_tally_result?.yes,
                                            item?.final_tally_result
                                          )} %`,
                                        },
                                        {
                                          value: Number(
                                            calculateVotes(
                                              item?.final_tally_result?.no,
                                              item?.final_tally_result
                                            )
                                          ),
                                          color: '#D74A4A',
                                          tooltip: `No ${calculateVotes(
                                            item?.final_tally_result?.no,
                                            item?.final_tally_result
                                          )} %`,
                                        },
                                        {
                                          value: Number(
                                            calculateVotes(
                                              item?.final_tally_result
                                                ?.no_with_veto,
                                              item?.final_tally_result
                                            )
                                          ),
                                          color: '#C2A3A3',

                                          tooltip: `No With Veto ${calculateVotes(
                                            item?.final_tally_result
                                              ?.no_with_veto,
                                            item?.final_tally_result
                                          )} %`,
                                        },
                                        {
                                          value: Number(
                                            calculateVotes(
                                              item?.final_tally_result?.abstain,
                                              item?.final_tally_result
                                            )
                                          ),
                                          color: '#C58E3D',

                                          tooltip: `Abstain ${calculateVotes(
                                            item?.final_tally_result?.abstain,
                                            item?.final_tally_result
                                          )} %`,
                                        },
                                      ]}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
GovernPastProposal.propTypes = {
  lang: PropTypes.string.isRequired,
  setAllProposals: PropTypes.func.isRequired,
  setProposals: PropTypes.func.isRequired,
  allProposals: PropTypes.array,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    allProposals: state.govern.allProposals,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(GovernPastProposal);
