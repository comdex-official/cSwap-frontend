import { useRouter } from "next/navigation";
import { Button, List, message, Select, Spin } from "antd";
import * as PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { setAllProposals, setProposals } from "../../actions/govern";
import { fetchRestProposals } from "../../services/govern/query";
import { formatTime } from "../../utils/date";
import { proposalStatusMap } from "../../utils/string";
import { DOLLAR_DECIMALS } from "../../constants/common";
import style from "./Govern.module.scss";
import { Progress } from "@mantine/core";
import NoDataIcon from "../../shared/components/NoDataIcon";
import { Icon } from "../../shared/image/Icon";

const { Option } = Select;

const Govern = ({ setAllProposals, allProposals, setProposals, proposals }) => {
  const router = useRouter();

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

  const data = [
    {
      title: "Total Staked",
      counts: 1234,
    },
    {
      title: "Total Proposals",
      counts: 7,
    },
    {
      title: "Average Participation",
      counts: "123%",
    },
  ];

  return (
    <>
      {inProgress && !proposals?.length ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <div className={`${style.govern_main_container} ${style.max_width}`}>
          <div className={style.govern_container}>
            {/* Upper copntainer  */}
            {/* <div className={style.govern_upper_main_container}>
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
                  } ${"govern_ant_list_class"}`}
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
            </div> */}
            {/* Bottom Container  */}
            <div className={style.govern_bottom_main_container}>
              <div className={style.govern_bottom_container}>
                <div className={style.govern_bottom_filters_container}>
                  <div className={style.governcard_head}>
                    {/* <Button
                    type="primary"
                    className={`${"btn-filled"} ${style.btn_filled}`}
                  >
                    New Proposal
                  </Button> */}
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
                      className="select-primary ml-2 filter-select"
                      style={{ width: 120 }}
                      onChange={(e) => filterAllProposal(e)}
                      suffixIcon={<Icon className={"bi bi-chevron-down"} />}
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
                {proposals?.length > 0 ? (
                  proposals?.map((item) => {
                    return (
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
                                  <span
                                    className={
                                      proposalStatusMap[item?.status] ===
                                        "Rejected" ||
                                      proposalStatusMap[item?.status] ===
                                        "Failed"
                                        ? "failed-circle"
                                        : proposalStatusMap[item?.status] ===
                                          "Passed"
                                        ? "passed-circle"
                                        : "warning-circle"
                                    }
                                  ></span>
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
                                  <p>
                                    {" "}
                                    {formatTime(item?.voting_start_time) ||
                                      "--/--/--"}
                                  </p>
                                </div>
                                <div className={style.time_right_container}>
                                  <label>Voting Ends :</label>
                                  <p>
                                    {formatTime(item?.voting_end_time) ||
                                      "--/--/--"}
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
                                        {`${calculateVotes(
                                          item?.final_tally_result
                                            ?.no_with_veto,
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
                                      color: "#03d707c4",
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
                                      color: "#FF6767",
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
                                      color: "#c0c0c0",

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
                                      color: "#b699ca",

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
                    );
                  })
                ) : (
                  <>
                    <NoDataIcon />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
