import { useRouter } from "next/navigation";
import {
  Button,
  Col,
  Input,
  List,
  message,
  Row,
  Select,
  Spin,
  Tabs,
} from "antd";
import * as PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { setAllProposals, setProposals } from "../../actions/govern";
import {
  fetchRestBondexTokens,
  fetchRestProposals,
  fetchRestTallyParamsProposer,
} from "../../services/govern/query";
import { formatTime } from "../../utils/date";
import { proposalStatusMap, stringTagParser } from "../../utils/string";
import { DOLLAR_DECIMALS } from "../../constants/common";
// import style from "./Govern.moduleOld.scss";
import { Progress } from "@mantine/core";
import NoDataIcon from "../../shared/components/NoDataIcon";
import { Icon } from "../../shared/image/Icon";
import GovernOpenProposal from "./openProposal/index";
import GovernPastProposal from "./pastProposal/index";
import { comdex } from "../../config/network";
import { No_Data } from "../../shared/image";
import { NextImage } from "../../shared/image/NextImage";
import Loading from "../../pages/Loading";

const { Option } = Select;

const Govern = ({
  setAllProposals,
  allProposals,
  setProposals,
  proposals,
  getTab,
}) => {
  const router = useRouter();

  const [inProgress, setInProgress] = useState(false);
  const [activeKey, setActiveKey] = useState(getTab? getTab: "1");
  const [pastProposals, setPastProposals] = useState();
  const [activeProposals, setActiveProposals] = useState();
  const [filteredProposal, setFilteredProposal] = useState();

  // useEffect(() => {
  //   if (getTab) {
  //     setActiveKey(getTab);
  //   } 
  // }, [getTab]);

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

  // useEffect(() => {
  //     fetchAllProposals();
  // }, [fetchAllProposals]);

  const filterAllProposal = (value) => {
    setInProgress(true);
    let oldProposals = proposals?.filter(
      (item) => item?.status !== "PROPOSAL_STATUS_VOTING_PERIOD"
    );
    let allFilteredProposal =
      pastProposals &&
      pastProposals?.filter((item) => {
        if (value === "all") {
          return oldProposals;
        } else {
          return item.status === value;
        }
      });
    setFilteredProposal(allFilteredProposal);
    setInProgress(false);
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

  useEffect(() => {
    const fetchData = async () => {
      let nextPage = "";
      let allProposals = [];

      do {
        const url = `${comdex?.rest}/cosmos/gov/v1beta1/proposals${nextPage}`;
        const response = await fetch(url);
        const data = await response.json();

        allProposals = [...allProposals, ...data.proposals];
        nextPage = data.pagination.next_key
          ? `?pagination.key=${data.pagination.next_key}`
          : null;
      } while (nextPage !== null);

      setProposals(allProposals?.reverse());
      setFilteredProposal(allProposals);
      setAllProposals(allProposals?.proposals);
    };

    fetchData();
  }, []);

  const onSearchChange = (searchKey) => {
    if (activeKey === "2") {
      let oldProposals = proposals?.filter(
        (item) => item?.status !== "PROPOSAL_STATUS_VOTING_PERIOD"
      );
      oldProposals = oldProposals?.filter(
        (item) =>
          item?.content?.title?.toLowerCase().includes(searchKey) ||
          (item?.proposal_id).includes(searchKey)
      );
      setFilteredProposal(oldProposals);
    } else {
      let ActiveProposals = proposals?.filter(
        (item) => item?.status === "PROPOSAL_STATUS_VOTING_PERIOD"
      );
      ActiveProposals = ActiveProposals?.filter(
        (item) =>
          item?.content?.title?.toLowerCase().includes(searchKey) ||
          (item?.proposal_id).includes(searchKey)
      );
      setFilteredProposal(ActiveProposals);
    }
  };

  const handleTabChange = (key) => {
    let openProposal = proposals?.filter(
      (item) => item?.status === "PROPOSAL_STATUS_VOTING_PERIOD"
    );
    let pastProposal = proposals?.filter(
      (item) => item?.status !== "PROPOSAL_STATUS_VOTING_PERIOD"
    );
    if (key === "1") {
      setFilteredProposal(openProposal);
      setActiveProposals(openProposal);
    } else {
      setFilteredProposal(pastProposal);
      setPastProposals(pastProposal);
    }
    setActiveKey(key);
  };

  const tabItems = [
    {
      key: "1",
      label: "Active Proposals",
    },
    {
      key: "2",
      label: "Past Proposals",
    },
  ];

  useEffect(() => {
    if (proposals) {
      let openProposal = proposals?.filter(
        (item) => item?.status === "PROPOSAL_STATUS_VOTING_PERIOD"
      );
      let pastProposal = proposals?.filter(
        (item) => item?.status !== "PROPOSAL_STATUS_VOTING_PERIOD"
      );

      if (activeKey === "1") {
        setFilteredProposal(openProposal);
      } else {
        setFilteredProposal(pastProposal);
      }
    }
  }, [proposals, activeKey]);

  if (inProgress) {
    return (
      <div className="no_data">
        <Loading />
      </div>
    );
  }

  const handleClick = () => {
    handleTabChange("2");
  };

  return (
    <>
      <div className={`govern_max_width`}>
        <div className="govern_main_container">
          <div className="govern_container">
            <div className="govern_tab_main_container">
              <div className="govern_tab">
                <Row className="pl-2">
                  <Col>
                    <div className="portifolio-tabs">
                      <Tabs
                        className="comdex-tabs"
                        onChange={handleTabChange}
                        activeKey={activeKey}
                        type="card"
                        items={tabItems}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="govern_search ">
                {activeKey === "2" && (
                  <Select
                    defaultValue="Filter"
                    className="select-primary filter-select govern-filter-search"
                    style={{ width: 150 }}
                    onChange={(e) => filterAllProposal(e)}
                    suffixIcon={<Icon className={"bi bi-chevron-down"} />}
                  >
                    <Option value="all" className="govern-select-option">
                      All
                    </Option>
                    <Option value="PROPOSAL_STATUS_DEPOSIT_PERIOD">
                      Pending
                    </Option>
                    <Option value="PROPOSAL_STATUS_PASSED">Passed</Option>
                    <Option value="PROPOSAL_STATUS_FAILED">Failed</Option>
                    <Option value="PROPOSAL_STATUS_REJECTED">Rejected</Option>
                  </Select>
                )}
                <Input
                  placeholder="Search..."
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="asset_search_input"
                  suffix={<Icon className={"bi bi-search"} />}
                />
              </div>
            </div>

            <div className="proposal_box_parent_container">
              {activeKey === "1" ?
              inProgress? 
              <div className="no_data">
              <Loading />
            </div>:

              (
                filteredProposal?.length > 0 ? (
                  <GovernOpenProposal proposals={filteredProposal} />
                ) : (
                  <div className={"table__empty__data__wrap"}>
                    <div className={"table__empty__data"}>
                      <NextImage
                        src={No_Data}
                        alt="Message"
                        height={60}
                        width={60}
                      />
                      <span>{"No Active Proposals"}</span>
                      <Button
                        type="primary"
                        className="btn-no-data"
                        onClick={() => handleClick()}
                      >
                        {"View Past Proposals"}
                      </Button>
                    </div>
                  </div>
                )
              ) :
              
              inProgress? 
              <div className="no_data">
              <Loading />
            </div>:
              filteredProposal?.length > 0 ?
              
              (
                <GovernPastProposal proposals={filteredProposal} />
              ) : (
                <div className={"table__empty__data__wrap"}>
                  <div className={"table__empty__data"}>
                    <NextImage
                      src={No_Data}
                      alt="Message"
                      height={60}
                      width={60}
                    />
                    <span>{"No Proposals"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
    getTab: state.govern.getTab,
    proposals: state.govern.proposals,
  };
};

const actionsToProps = {
  setAllProposals,
  setProposals,
};

export default connect(stateToProps, actionsToProps)(Govern);
