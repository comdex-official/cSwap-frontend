import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// const GovernCard = dynamic(() => import('@/modules/bridge/BridgeCard'));

import style from "./Govern.module.scss";

import { Button, List, Select } from "antd";
import { Progress } from "@mantine/core";

const Govern = () => {
  const router = useRouter();

  const { Option } = Select;

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
          </div>
          {/* Bottom Container  */}
          <div className={style.govern_bottom_main_container}>
            <div
              className={style.govern_bottom_container}
              onClick={() => router.push(`/govern/${1}`)}
            >
              <div className={style.govern_bottom_filters_container}>
                <div className={style.governcard_head}>
                  <Button
                    type="primary"
                    className={`${"btn-filled"} ${style.btn_filled}`}
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
                  >
                    <Option value="all" className="govern-select-option">
                      All
                    </Option>
                    <Option value="open">Open</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="passed">Passed</Option>
                    <Option value="executed">Executed</Option>
                    <Option value="rejected">Rejected</Option>
                  </Select>
                </div>
              </div>
              <div className={style.govern_bottom_proposals_container}>
                <div className={style.governlist_row}>
                  <div className={style.left_section}>
                    <div className={style.proposal_status_container}>
                      <div className={style.proposal_id}>
                        <h3>#1</h3>
                      </div>
                      <div className={style.proposal_status_container}>
                        <div
                          className={`${style.proposal_status} ${style.passed_color}`}
                        >
                          Passed
                        </div>
                      </div>
                    </div>
                    <h3>Lorem ipsum dolor sit amet.</h3>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Iure dolore quod et similique? Dolor beatae sint facere
                      debitis nobis odio, nam maiores optio distinctio natus
                      iusto fugit quisquam.{" "}
                    </p>
                  </div>
                  <div className={style.right_section}>
                    <div>
                      <div className={style.time_main_container}>
                        <div className={style.time_left_container}>
                          <label>Voting Starts :</label>
                          <p>{"--/--/--"} UTC</p>
                        </div>
                        <div className={style.time_right_container}>
                          <label>Voting Ends :</label>
                          <p>{"--/--/--"} UTC</p>
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
                              <div className={style.vote}>20%</div>
                            </div>
                          </div>
                          <div className={style.single_vote_container}>
                            <div
                              className={`${style.boder} ${style.no_border}`}
                            ></div>
                            <div className={style.text_container}>
                              <div className="title">No</div>
                              <div className="vote">10%</div>
                            </div>
                          </div>
                          <div className={style.single_vote_container}>
                            <div
                              className={`${style.boder} ${style.veto_border}`}
                            ></div>
                            <div className={style.text_container}>
                              <div className="title">No With Veto</div>
                              <div className="vote">35%</div>
                            </div>
                          </div>
                          <div className={style.single_vote_container}>
                            <div
                              className={`${style.boder} ${style.abstain_border}`}
                            ></div>
                            <div className={style.text_container}>
                              <div className="title">Abstain</div>
                              <div className="vote">40%</div>
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
                              value: 20,
                              color: "#03d707c4",
                              tooltip: "Yes" + " " + 20 + "%",
                            },
                            {
                              value: 15,
                              color: "#FF6767",
                              tooltip: "No" + " " + 15 + "%",
                            },
                            {
                              value: 25,
                              color: "#c0c0c0",
                              tooltip: "No With Veto" + " " + 25 + "%",
                            },
                            {
                              value: 40,
                              color: "#b699ca",
                              tooltip: "Abstain" + " " + 40 + "%",
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
        </div>
      </div>
    </>
  );
};

export default Govern;
