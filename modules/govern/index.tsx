import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// const GovernCard = dynamic(() => import('@/modules/bridge/BridgeCard'));

import style from './Govern.module.scss';

import { Button, List, Select, Spin, message } from 'antd';
import { Progress } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { fetchRestProposals } from '@/services/govern/query';
import {
  DOLLAR_DECIMALS,
  formatNumber,
  formatTime,
  proposalStatusMap,
} from '@/helpers/utils';

const Govern = () => {
  const router = useRouter();

  const { Option } = Select;

  const data = [
    {
      title: 'Total Staked',
      counts: 1234,
    },
    {
      title: 'Total Proposals',
      counts: 7,
    },
    {
      title: 'Average Participation',
      counts: '123%',
    },
  ];

  const [inProgress, setInProgress] = useState(false);
  const [allProposals, setAllProposals] = useState([]);
  const [proposals, setProposals] = useState([]);

  const fetchAllProposals = useCallback(() => {
    setInProgress(true);
    fetchRestProposals((error: any, result: any) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      setProposals(result?.proposals?.reverse());
      setAllProposals(result?.proposals);
    });
  }, []);

  useEffect(() => {
    fetchAllProposals();
  }, [fetchAllProposals]);

  const calculateVotes = useCallback(
    (value: string, final_tally_result: any) => {
      let yes = Number(final_tally_result?.yes);
      let no = Number(final_tally_result?.no);
      let veto = Number(final_tally_result?.no_with_veto);
      let abstain = Number(final_tally_result?.abstain);
      let totalValue = yes + no + abstain + veto;

      let result = Number((Number(value) / totalValue || 0) * 100).toFixed(
        DOLLAR_DECIMALS
      );

      return result;
    },
    []
  );

  const filterAllProposal = (value: any) => {
    let allFilteredProposal =
      allProposals &&
      allProposals?.filter((item: any) => {
        if (value === 'all') {
          return allProposals;
        }
        return item.status === value;
      });
    setProposals(allFilteredProposal);
  };

  return (
    <>
      {inProgress && !allProposals?.length ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <div className={`${style.govern_main_container} ${style.max_width}`}>
          <div className={style.govern_container}>
            {/* Upper copntainer  */}
            <div className={style.govern_upper_main_container}>
              <div className={style.govern_upper_container}>
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 3,
                    xl: 3,
                    xxl: 3,
                  }}
                  className={`${
                    style.govern_upper_container_list
                  } ${'govern_ant_list_class'}`}
                  dataSource={data}
                  renderItem={(item) => (
                    <List.Item>
                      <div>
                        <p>{item.title}</p>
                        <h3>{item.counts}</h3>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </div>
            {/* Bottom Container  */}
            <div className={style.govern_bottom_main_container}>
              <div className={style.govern_bottom_container}>
                <div className={style.govern_bottom_filters_container}>
                  <div className={style.governcard_head}>
                    <Button
                      type="primary"
                      className={`${'btn-filled'} ${style.btn_filled}`}
                    >
                      New Proposal
                    </Button>
                    <a
                      href="https://forum.comdex.one/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button type="primary" className="btn-filled">
                        Forum
                      </Button>
                    </a>
                    <Select
                      defaultValue="Filter"
                      className="select-primary ml-2"
                      style={{ width: 120 }}
                      onChange={(e) => filterAllProposal(e)}
                    >
                      <Option value="all" className="govern-select-option">
                        All
                      </Option>
                      <Option value="PROPOSAL_STATUS_VOTING_PERIOD">
                        Open
                      </Option>
                      <Option value="PROPOSAL_STATUS_DEPOSIT_PERIOD">
                        Pending
                      </Option>
                      <Option value="PROPOSAL_STATUS_PASSED">Passed</Option>
                      <Option value="PROPOSAL_STATUS_FAILED">Failed</Option>
                      <Option value="PROPOSAL_STATUS_REJECTED">Rejected</Option>
                    </Select>
                  </div>
                </div>
                {proposals &&
                  proposals.map((item: any) => (
                    <div
                      className={style.govern_bottom_proposals_container}
                      key={item?.proposal_id}
                      onClick={() =>
                        router.push(`/govern/${item?.proposal_id}`)
                      }
                    >
                      <div className={style.governlist_row}>
                        <div className={style.left_section}>
                          <div className={style.proposal_status_container}>
                            <div className={style.proposal_id}>
                              <h3> #{item?.proposal_id}</h3>
                            </div>
                            <div className={style.proposal_status_container}>
                              <div
                                className={`${style.proposal_status} ${style.passed_color}`}
                              >
                                {proposalStatusMap[item?.status]}
                              </div>
                            </div>
                          </div>
                          <h3>{item?.content?.title}</h3>
                          <p>{item?.content?.description} </p>
                        </div>
                        <div className={style.right_section}>
                          <div>
                            <div className={style.time_main_container}>
                              <div className={style.time_left_container}>
                                <label>Voting Starts :</label>
                                {formatTime(item?.voting_start_time) ||
                                  '--/--/--'}
                              </div>
                              <div className={style.time_right_container}>
                                <label>Voting Ends :</label>
                                <p>
                                  {formatTime(item?.voting_end_time) ||
                                    '--/--/--'}
                                </p>
                              </div>
                            </div>
                            <div className={style.user_vote_box_container}>
                              <div className={style.user_vote_box}>
                                <div className={style.single_vote_container}>
                                  <div
                                    className={`${style.boder} ${style.yes_border}`}
                                  ></div>
                                  <div className={style.text_container}>
                                    <div className={style.title}>Yes</div>
                                    <div className={style.vote}>
                                      {`${calculateVotes(
                                        item?.final_tally_result?.yes,
                                        item?.final_tally_result
                                      )}%`}
                                    </div>
                                  </div>
                                </div>
                                <div className={style.single_vote_container}>
                                  <div
                                    className={`${style.boder} ${style.no_border}`}
                                  ></div>
                                  <div className={style.text_container}>
                                    <div className="title">No</div>
                                    <div className="vote">
                                      {' '}
                                      {`${calculateVotes(
                                        item?.final_tally_result?.no,
                                        item?.final_tally_result
                                      )}%`}
                                    </div>
                                  </div>
                                </div>
                                <div className={style.single_vote_container}>
                                  <div
                                    className={`${style.boder} ${style.veto_border}`}
                                  ></div>
                                  <div className={style.text_container}>
                                    <div className="title">No With Veto</div>
                                    <div className="vote">
                                      {' '}
                                      {`${calculateVotes(
                                        item?.final_tally_result?.no_with_veto,
                                        item?.final_tally_result
                                      )}%`}
                                    </div>
                                  </div>
                                </div>
                                <div className={style.single_vote_container}>
                                  <div
                                    className={`${style.boder} ${style.abstain_border}`}
                                  ></div>
                                  <div className={style.text_container}>
                                    <div className="title">Abstain</div>
                                    <div className="vote">
                                      {' '}
                                      {`${calculateVotes(
                                        item?.final_tally_result?.abstain,
                                        item?.final_tally_result
                                      )}%`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
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
                                    color: '#03d707c4',
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
                                    color: '#FF6767',
                                    tooltip: `No ${calculateVotes(
                                      item?.final_tally_result?.no,
                                      item?.final_tally_result
                                    )} %`,
                                  },
                                  {
                                    value: Number(
                                      calculateVotes(
                                        item?.final_tally_result?.no_with_veto,
                                        item?.final_tally_result
                                      )
                                    ),
                                    color: '#c0c0c0',

                                    tooltip: `No With Veto ${calculateVotes(
                                      item?.final_tally_result?.no_with_veto,
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
                                    color: '#b699ca',

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
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Govern;