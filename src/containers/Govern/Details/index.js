import { Button, List, message } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  setProposal,
  setProposalTally,
  setProposer
} from "../../../actions/govern";
import { Col, Row, SvgIcon } from "../../../components/common";
import Copy from "../../../components/Copy";
import { comdex } from "../../../config/network";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import {
  fetchRestProposal,
  fetchRestProposalTally,
  fetchRestProposer,
  queryUserVote
} from "../../../services/govern/query";
import { denomConversion } from "../../../utils/coin";
import { formatTime } from "../../../utils/date";
import { formatNumber } from "../../../utils/number";
import {
  proposalOptionMap,
  proposalStatusMap,
  stringTagParser,
  truncateString
} from "../../../utils/string";
import VoteNowModal from "../VoteNowModal";
import "./index.scss";

const GovernDetails = ({
  address,
  setProposal,
  proposalMap,
  setProposer,
  proposerMap,
  setProposalTally,
  proposalTallyMap,
}) => {
  const { id } = useParams();
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

  const data = [
    {
      title: "Voting Starts",
      counts: formatTime(proposal?.voting_start_time) || "--/--/--",
    },
    {
      title: "Voting Ends",
      counts: formatTime(proposal?.voting_end_time) || "--/--/--",
    },
    {
      title: "Proposer",
      counts: (
        <div className="address_with_copy">
          {proposer ? (
            <>
              <span className="mr-1">{truncateString(proposer, 6, 6)}</span>
              <Copy text={proposer} />
            </>
          ) : null}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (id) {
      fetchRestProposal(id, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setProposal(result?.proposal);
      });
      fetchRestProposalTally(id, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setProposalTally(result?.tally, id);
      });

      fetchRestProposer(id, (error, result) => {
        if (error) {
          message.error(error);
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
    queryUserVote(address, proposal?.proposal_id, (error, result) => {
      if (error) {
        return;
      }

      setVotedOption(result?.vote?.option);
    });
  }, [address, proposal?.proposal_id]);

  useEffect(() => {
    if (proposal?.proposal_id) {
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

  const dataVote = [
    {
      title: "Total Vote",
      counts: (
        <>
          {calculateTotalValue() || "0"}{" "}
          {denomConversion(comdex?.coinMinimalDenom)}
        </>
      ),
    },
  ];

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 180,
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
        fontSize: "25px",
        fontWeight: "500",
        fontFamily: "Lexend Deca",
        color: "#fff",
      },
      y: 70,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "120%",
        innerSize: "75%",
        borderWidth: 0,
        className: "votes-chart",
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
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: "Yes",
            y: Number(getVotes?.yes || 0),
            color: "#52B788",
          },
          {
            name: "No",
            y: Number(getVotes?.no || 0),
            color: "#F76872",
          },
          {
            name: "No With Veto",
            y: Number(getVotes?.veto || 0),
            color: "#AACBB9",
          },
          {
            name: "Abstain",
            y: Number(getVotes?.abstain || 0),
            color: "#6A7B6C",
          },
        ],
      },
    ],
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col className="text-right mb-3">
          <Link to="/govern">
            <Button className="back-btn" type="primary">
              Back
            </Button>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="composite-card myhome-upper earn-deposite-card d-block">
            <div className="card-header">PROPOSAL DETAILS</div>
            <div className="myhome-upper-left w-100">
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
                dataSource={data}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <p>{item?.title}</p>
                      <h3>{item?.counts}</h3>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <div className="composite-card govern-card2 earn-deposite-card h-100">
            <Row>
              <Col>
                <h3>#{proposal?.proposal_id || id}</h3>
              </Col>
              <Col className="text-right">
                <Button type="primary">
                  <span
                    className={
                      proposalStatusMap[proposal?.status] === "Rejected" ||
                      proposalStatusMap[proposal?.status] === "Failed"
                        ? "failed-circle"
                        : proposalStatusMap[proposal?.status] === "Passed"
                        ? "passed-circle"
                        : "warning-circle"
                    }
                  ></span>
                  {proposalStatusMap[proposal?.status]}
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <h3>{proposal?.content?.title}</h3>
                <div className="description-row">
                  <p>
                    {stringTagParser(proposal?.content?.description || " ")}{" "}
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        <Col md="6">
          <div className="composite-card govern-card2 earn-deposite-card">
            <Row>
              {address && proposalOptionMap[votedOption] ? (
                <div className="user-vote-container">
                  {proposalOptionMap?.[votedOption] && (
                    <div>
                      Your Vote :{" "}
                      <span className="vote_msg">
                        {" "}
                        {proposalOptionMap[votedOption]}{" "}
                      </span>{" "}
                    </div>
                  )}
                  <Col className="text-right">
                    <VoteNowModal refreshVote={fetchVote} proposal={proposal} />
                  </Col>
                </div>
              ) : (
                <Col className="text-right">
                  <VoteNowModal refreshVote={fetchVote} proposal={proposal} />
                </Col>
              )}
            </Row>
            <Row>
              <Col>
                <div className="govern-dlt-card">
                  <div className="govern-dlt-chart">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={Options}
                    />
                  </div>
                  <div className="govern-dlt-right">
                    <List
                      grid={{
                        gutter: 16,
                        xs: 1,
                      }}
                      dataSource={dataVote}
                      renderItem={(item) => (
                        <List.Item>
                          <div>
                            <p>{item.title}</p>
                            <h3 className="count">{item.counts}</h3>
                          </div>
                        </List.Item>
                      )}
                    />
                    <ul className="vote-lists">
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>Yes</label>
                          <p>{Number(getVotes?.yes || "0.00")}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>No</label>
                          <p>{Number(getVotes?.no || "0.00")}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>No With Veto </label>
                          <p>{Number(getVotes?.veto || "0.00")}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>Abstain</label>
                          <p>{Number(getVotes?.abstain || "0.00")}%</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

GovernDetails.propTypes = {
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
  };
};

const actionsToProps = {
  setProposal,
  setProposer,
  setProposalTally,
};

export default connect(stateToProps, actionsToProps)(GovernDetails);
