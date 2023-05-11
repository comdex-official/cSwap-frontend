import { useEffect, useState } from "react";
import style from "./Govern.module.scss";
// import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useRouter } from "next/navigation";
import { Button, List } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Link from "next/link";

const GovernView = () => {
  // const theme = useAppSelector((state) => state.theme.theme);
  // const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const data = [
    {
      title: "Voting Start",
      counts: "2023-04-24",
    },
    {
      title: "Voting Ends",
      counts: "2023-04-25",
    },
    {
      title: "Proposer",
      counts: "comdexsfe...re43",
    },
  ];

  const Options = {
    chart: {
      type: "pie",
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
        className: "highchart_chart",
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
        name: "",
        data: [
          {
            name: "Yes",
            y: 48,
            color: "#03d707c4",
          },
          {
            name: "No",
            y: 20,
            color: "#FF6767",
          },
          {
            name: "No With Veto",
            y: 14,
            color: "#C0C0C0",
          },
          {
            name: "Abstain",
            y: 33,
            color: "#B699CA",
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
                } ${"govern_ant_list_class"} ${
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
                <div className={style.proposal_id}>#137</div>
                <div className={`${style.status} ${style.passed_color}`}>
                  Passed
                </div>
              </div>
              <div className={style.bottom_main_container}>
                <div className={style.title}>Lorem ipsum dolor sit amet.</div>
                <div className={style.description}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Doloribus, aspernatur alias esse in earum at accusamus culpa
                  voluptate aut aliquid? Lorem, ipsum dolor sit amet consectetur
                  adipisicing elit. Eveniet alias inventore a quis,
                  exercitationem aspernatur minima in iste temporibus nostrum
                  consequatur mollitia voluptatibus, blanditiis cupiditate,
                  deserunt expedita impedit fugiat ipsum. Lorem ipsum dolor sit,
                  amet consectetur adipisicing elit. Nesciunt accusamus
                  perferendis assumenda recusandae aliquid optio modi saepe illo
                  non mollitia?
                </div>
              </div>
            </div>
            <div className={style.govern_detail_right_container}>
              <div className={style.vote_button}>
                <div className={style.user_vote}>
                  {" "}
                  Your Vote : <span>Yes</span>{" "}
                </div>
                <Button type="primary" className={style.ant_vote_button}>
                  Vote Now
                </Button>
              </div>
              <div className={style.charts_Value_container}>
                <div className={style.charts}>
                  <HighchartsReact highcharts={Highcharts} options={Options} />
                </div>
                <div className={style.total_value}>
                  <div className={style.vote_border}>
                    <div className={style.title}>Total Vote</div>
                    <div className={style.value}>23,342,32 CMDX</div>
                  </div>
                </div>
              </div>
              <div className={style.vote_count_container}>
                <div className={style.yes_container}>
                  <div className={style.fill_box}></div>
                  <div className={style.data_box}>
                    <div className={style.title}>Yes</div>
                    <div className={style.value}>48 %</div>
                  </div>
                </div>
                <div className={style.no_container}>
                  <div className={style.fill_box}></div>
                  <div className={style.data_box}>
                    <div className={style.title}>No</div>
                    <div className={style.value}>20%</div>
                  </div>
                </div>
                <div className={style.noWithVeto_container}>
                  <div className={style.fill_box}></div>
                  <div className={style.data_box}>
                    <div className={style.title}>No With Veto</div>
                    <div className={style.value}>14%</div>
                  </div>
                </div>
                <div className={style.abstain_container}>
                  <div className={style.fill_box}></div>
                  <div className={style.data_box}>
                    <div className={style.title}>Abstain</div>
                    <div className={style.value}>33%</div>
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

export default GovernView;
