import { Button, message, Select, Spin, List, Progress } from "antd";
import * as PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { setAllProposals, setProposals } from "../../actions/govern";
import { Col, Row, SvgIcon } from "../../components/common";
import NoDataIcon from "../../components/common/NoDataIcon";
import { fetchRestProposals } from "../../services/govern/query";
import { formatTime } from "../../utils/date";
import { proposalStatusMap } from "../../utils/string";
import "./index.scss";

const { Option } = Select;

const data = [
  {
    title: "Total Staked",
    counts: '312.45',
  },
  {
    title: "Total Proposals",
    counts: '7',
  },
  {
    title: "Average Participation",
    counts: '50.12%',
  },
];

const Govern = ({ setAllProposals, allProposals, setProposals, proposals }) => {
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState(false);

  const fetchAllProposals = useCallback(() => {
    setInProgress(true);
    fetchRestProposals((error, result) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }

      setProposals(result?.proposals?.reverse());
      setAllProposals(result?.proposals);
    });
  }, [setAllProposals, setProposals]);

  useEffect(() => {
    fetchAllProposals();
  }, [fetchAllProposals]);

  const filterAllProposal = (value) => {
    let allFilteredProposal =
      allProposals &&
      allProposals?.filter((item) => {
        if (value === "all") {
          return allProposals;
        }
        return item.status === value;
      });
    setProposals(allFilteredProposal);
  };

  return (
    <div className="app-content-wrapper">
      {inProgress && !proposals?.length ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <>
          <Row>
            <Col>
              <div className="govern-upper-card">
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
            <Col>
              <div className="comdex-card govern-card">
                <div className="governcard-head">
                  <Button type="primary" className="px-4">
                    New Proposal
                  </Button>
                  <a
                    aria-label="Twitter"
                    target="_blank"
                    rel="noreferrer"
                    href="https://forum.comdex.one"
                  >
                    <Button type="primary" className="px-5">
                      Forum
                    </Button>
                  </a>
                  <Select
                    defaultValue="Filter"
                    className="select-primary ml-2 filter-select"
                    onChange={(e) => filterAllProposal(e)}
                    suffixIcon={
                      <SvgIcon name="arrow-down" viewbox="0 0 19.244 10.483" />
                    }
                  >
                    <Option value="all" className="govern-select-option">
                      All
                    </Option>
                    <Option value="PROPOSAL_STATUS_VOTING_PERIOD">Open</Option>
                    <Option value="PROPOSAL_STATUS_DEPOSIT_PERIOD">
                      Pending
                    </Option>
                    <Option value="PROPOSAL_STATUS_PASSED">Passed</Option>
                    <Option value="PROPOSAL_STATUS_FAILED">Failed</Option>
                    <Option value="PROPOSAL_STATUS_REJECTED">Rejected</Option>
                  </Select>
                </div>
                <div className="govern-card-content">
                  {proposals?.length > 0 ? (
                    proposals?.map((item) => {
                      return (
                        <div
                          key={item?.proposal_id}
                          className="governlist-row"
                          onClick={() =>
                            navigate(`/govern/${item?.proposal_id}`)
                          }
                        >
                          <div className="left-section">
                            <h3 className="d-flex align-items-center">
                              #{item?.proposal_id}
                              <Button className="ml-3">
                                <span
                                  className={
                                    proposalStatusMap[item?.status] ===
                                      "Rejected" ||
                                    proposalStatusMap[item?.status] === "Failed"
                                      ? "failed-circle"
                                      : proposalStatusMap[item?.status] ===
                                        "Passed"
                                      ? "passed-circle"
                                      : "warning-circle"
                                  }
                                ></span>
                                {proposalStatusMap[item?.status]}
                              </Button>
                            </h3>
                            <p>{item?.content?.title}</p>
                            <p>{item?.content?.description} </p>
                          </div>
                          <div className="right-section">
                            <Row>
                              <Col sm="6" className="right-col">
                                <label>Voting starts :</label>
                                <p>
                                  {formatTime(item?.voting_start_time) ||
                                    "--/--/--"}
                                </p>
                              </Col>
                              <Col sm="6" className="right-col">
                                <label>Voting Ends :</label>
                                <p>
                                  {formatTime(item?.voting_end_time) ||
                                    "--/--/--"}
                                </p>
                              </Col>
                              <Col sm="6" className="right-col">
                                <label>Duration :</label>
                                <p>
                                  3 days
                                </p>
                              </Col>
                            </Row>
                            <Row className='mt-2'>
                              <Col>
                                <Progress percent={70} success={{ percent: 45 }} />
                              </Col>
                            </Row>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <NoDataIcon />
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

Govern.propTypes = {
  lang: PropTypes.string.isRequired,
  setAllProposals: PropTypes.func.isRequired,
  setProposals: PropTypes.func.isRequired,
  allProposals: PropTypes.array,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    allProposals: state.govern.allProposals,
    proposals: state.govern.proposals,
  };
};

const actionsToProps = {
  setAllProposals,
  setProposals,
};

export default connect(stateToProps, actionsToProps)(Govern);
