import { useCallback, useEffect, useState } from 'react';
import style from './Govern.module.scss';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useRouter } from 'next/router';
import { Button, List, Spin } from 'antd';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Link from 'next/link';
import {
  fetchRestProposal,
  fetchRestProposalTally,
  fetchRestProposer,
  queryUserVote,
} from '@/services/govern/query';
import { formatTime } from '@/utils/date';
import {
  proposalOptionMap,
  proposalStatusMap,
  stringTagParser,
  truncateString,
} from '@/utils/string';
import { formatNumber } from '@/utils/number';
import { DOLLAR_DECIMALS } from '@/constants/common';
import { denomConversion } from '@/utils/coin';
import VoteNowModal from './VoteNowModal';

const GovernView = () => {
  const comdex = useAppSelector((state) => state.config.config);
  const account = useAppSelector((state) => state.account);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const router = useRouter();
  const { id } = router.query;

  const [votedOption, setVotedOption] = useState<number>(3);
  const [getVotes, setGetVotes] = useState({
    yes: 0,
    no: 0,
    veto: 0,
    abstain: 0,
  });

  const [inProgress, setInProgress] = useState(true);
  const [proposal, setProposal] = useState<any>();
  const [proposalTally, setProposalTally] = useState<any>();
  const [proposer, setProposer] = useState<any>();

  const data = [
    {
      title: 'Voting Start',
      counts: proposal?.voting_start_time
        ? formatTime(proposal?.voting_start_time)
        : '--/--/-- 00:00:00',
    },
    {
      title: 'Voting Ends',
      counts: proposal?.voting_end_time
        ? formatTime(proposal?.voting_end_time)
        : '--/--/-- 00:00:00',
    },
    {
      title: 'Proposer',
      counts: (
        <div className="address_with_copy">
          {proposer ? (
            <>
              <span className="mr-1">{truncateString(proposer, 6, 6)}</span>
            </>
          ) : (
            '------'
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (id) {
      fetchRestProposal(id, (error: any, result: any) => {
        if (error) {
          setInProgress(false);
          return;
        }
        setInProgress(false);
        setProposal(result?.proposal);
      });
      fetchRestProposalTally(id, (error: any, result: any) => {
        if (error) {
          return;
        }

        setProposalTally(result?.tally);
      });

      fetchRestProposer(id, (error: any, result: any) => {
        if (error) {
          return;
        }

        if (result?.tx_responses?.[0]?.tx?.body?.messages?.[0]?.proposer) {
          setProposer(
            result?.tx_responses?.[0]?.tx?.body?.messages?.[0]?.proposer
          );
        }
      });
    }
  }, [id, setProposal, setProposer, setProposalTally]);

  const fetchVote = useCallback(() => {
    queryUserVote(
      account?.address,
      proposal?.proposal_id,
      (error: any, result: any) => {
        if (error) {
          return;
        }

        setVotedOption(result?.vote?.option);
      }
    );
  }, [proposal?.proposal_id, account?.address]);

  useEffect(() => {
    if (proposal?.proposal_id) {
      fetchVote();
    }
  }, [id, proposal, fetchVote, account]);

  const calculateTotalValue = () => {
    let yes = Number(proposalTally?.yes);
    let no = Number(proposalTally?.no);
    let veto = Number(proposalTally?.no_with_veto);
    let abstain = Number(proposalTally?.abstain);

    let totalValue: any = yes + no + abstain + veto;

    totalValue = totalValue / 1000000;
    totalValue = formatNumber(totalValue);
    return totalValue;
  };

  const calculateVotes = useCallback(() => {
    let yes: any = Number(proposalTally?.yes);
    let no: any = Number(proposalTally?.no);
    let veto: any = Number(proposalTally?.no_with_veto);
    let abstain: any = Number(proposalTally?.abstain);
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
  }, [calculateVotes, proposalTally?.yes]);

  const Options = {
    chart: {
      type: 'pie',
      backgroundColor: null,
      height: 160,
      width: 220,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    subtitle: {
      floating: true,
      style: {
        fontSize: '25px',
        fontWeight: '500',
        fontFamily: 'Lexend Deca',
        color: '#fff',
      },
      y: 70,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: '120%',
        innerSize: '75%',
        borderWidth: 0,
        className: 'highchart_chart',
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: true,
          },
        },
        name: '',
        data: [
          {
            name: 'Yes',
            y: Number(getVotes?.yes || 0),
            color: '#03d707c4',
          },
          {
            name: 'No',
            y: Number(getVotes?.no || 0),
            color: '#FF6767',
          },
          {
            name: 'No With Veto',
            y: Number(getVotes?.veto || 0),
            color: '#C0C0C0',
          },
          {
            name: 'Abstain',
            y: Number(getVotes?.abstain || 0),
            color: '#B699CA',
          },
        ],
      },
    ],
  };

  return (
    <>
      <div className={`${style.govern_main_container} ${style.max_width}`}>
        <div className={style.back_button_container}>
          <Link href="/govern">
            <Button type="primary">Back</Button>
          </Link>
        </div>
        {inProgress ? (
          <div className={'loader'}>
            <Spin />
          </div>
        ) : (
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
                  } ${'govern_ant_list_class'} ${
                    style.govern_detail_ant_list_class
                  }`}
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
            <div className={style.govern_detail_bottom_main_container}>
              <div className={style.govern_detail_left_container}>
                <div className={style.up_main_container}>
                  <div className={style.proposal_id}>
                    #{proposal?.proposal_id || '-'}
                  </div>
                  <div className={`${style.status} ${style.passed_color}`}>
                    <div
                      className={
                        proposalStatusMap[proposal?.status] === 'Rejected' ||
                        proposalStatusMap[proposal?.status] === 'Failed'
                          ? 'failed-circle'
                          : proposalStatusMap[proposal?.status] === 'Passed'
                          ? 'passed-circle'
                          : 'warning-circle'
                      }
                    ></div>
                    {proposalStatusMap[proposal?.status]}
                  </div>
                </div>
                <div className={style.bottom_main_container}>
                  <div className={style.title}>
                    {proposal?.content?.title || '------'}
                  </div>
                  <div className={style.description}>
                    {stringTagParser(proposal?.content?.description || ' ')}{' '}
                  </div>
                </div>
              </div>
              <div className={style.govern_detail_right_container}>
                {account.address && proposalOptionMap[votedOption] && (
                  <div className={style.vote_button}>
                    {proposalOptionMap?.[votedOption] && (
                      <div className={style.user_vote}>
                        {' '}
                        Your Vote :{' '}
                        <span>{proposalOptionMap[votedOption]}</span>
                      </div>
                    )}

                    <VoteNowModal
                      refreshVote={fetchVote}
                      proposal={proposal}
                      address={account.address}
                    />
                    {/* <Button type="primary" >
                      Vote Now
                    </Button> */}
                  </div>
                )}

                <div className={style.charts_Value_container}>
                  <div className={style.charts}>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={Options}
                    />
                  </div>
                  <div className={style.total_value}>
                    <div className={style.vote_border}>
                      <div className={style.title}>Total Vote</div>
                      <div className={style.value}>{`${
                        calculateTotalValue() || '0'
                      } ${denomConversion(comdex?.coinMinimalDenom)}`}</div>
                    </div>
                  </div>
                </div>
                <div className={style.vote_count_container}>
                  <div className={style.yes_container}>
                    <div className={style.fill_box}></div>
                    <div className={style.data_box}>
                      <div className={style.title}>Yes</div>
                      <div className={style.value}>{`${Number(
                        getVotes?.yes || '0.00'
                      )}%`}</div>
                    </div>
                  </div>
                  <div className={style.no_container}>
                    <div className={style.fill_box}></div>
                    <div className={style.data_box}>
                      <div className={style.title}>No</div>
                      <div className={style.value}>{`${Number(
                        getVotes?.no || '0.00'
                      )}%`}</div>
                    </div>
                  </div>
                  <div className={style.noWithVeto_container}>
                    <div className={style.fill_box}></div>
                    <div className={style.data_box}>
                      <div className={style.title}>No With Veto</div>
                      <div className={style.value}>{`${Number(
                        getVotes?.veto || '0.00'
                      )}%`}</div>
                    </div>
                  </div>
                  <div className={style.abstain_container}>
                    <div className={style.fill_box}></div>
                    <div className={style.data_box}>
                      <div className={style.title}>Abstain</div>
                      <div className={style.value}>{`${Number(
                        getVotes?.abstain || '0.00'
                      )}%`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GovernView;
