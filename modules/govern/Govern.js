import { useRouter } from "next/navigation";
import { Button, Col, Input, List, message, Row, Select, Spin, Tabs } from "antd";
import * as PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { setAllProposals, setProposals } from "../../actions/govern";
import { fetchRestProposals } from "../../services/govern/query";
import { formatTime } from "../../utils/date";
import { proposalStatusMap, stringTagParser } from "../../utils/string";
import { DOLLAR_DECIMALS } from "../../constants/common";
// import style from "./Govern.moduleOld.scss";
import { Progress } from "@mantine/core";
import NoDataIcon from "../../shared/components/NoDataIcon";
import { Icon } from "../../shared/image/Icon";
import GovernOpenProposal from './openProposal/index'
import GovernPastProposal from './pastProposal/index'
import { comdex } from "../../config/network";

const { Option } = Select;

const Govern = ({ setAllProposals, allProposals, setProposals, proposals }) => {
    const router = useRouter();

    const [inProgress, setInProgress] = useState(false);
    const [activeKey, setActiveKey] = useState("1");

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

    useEffect(() => {
        const fetchData = async () => {
            let nextPage = '';
            let allProposals = [];

            do {
                const url = `${comdex?.rest}/cosmos/gov/v1beta1/proposals${nextPage}`;
                const response = await fetch(url);
                const data = await response.json();

                allProposals = [...allProposals, ...data.proposals];
                nextPage = data.pagination.next_key ? `?pagination.key=${data.pagination.next_key}` : null;
            } while (nextPage !== null);

            setProposals(allProposals?.reverse());
            setAllProposals(allProposals?.proposals);
        };

        fetchData();
    }, []);

    const onSearchChange = (searchKey) => {
        console.log(searchKey);
    };

    const tabItems = [

        {
            key: "1",
            label: "Open Proposals",
        },
        {
            key: "2",
            label: "Past Proposals",
        },
    ];

    return (
        <>
            <div className={`mt-4 govern_max_width`}>

                <div className="govern_main_container">
                    <div className="govern_container">
                        <div className="govern_tab_main_container">
                            <div className="govern_tab">
                                <Row className="pl-4">
                                    <Col >
                                        <div className="portifolio-tabs">
                                            <Tabs
                                                className="comdex-tabs"
                                                onChange={setActiveKey}
                                                activeKey={activeKey}
                                                type="card"
                                                items={tabItems}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div className="govern_search ">
                                <Input
                                    placeholder="Search..."
                                    onChange={(event) => onSearchChange(event.target.value)}
                                    className="asset_search_input"
                                />
                            </div>
                        </div>
                        {/* ist container start */}
                        <div className="proposal_box_parent_container">

                            {proposals?.length > 0 ?
                                <GovernOpenProposal proposals={proposals} />
                                : <h1>No Active proposal</h1>
                            }
                            {/* {proposals?.length > 0 ?
                                <GovernPastProposal proposals={proposals} />
                                : <h1>No Past proposal</h1>
                            } */}

                            {/* 1st container end  */}

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
        proposals: state.govern.proposals,
    };
};

const actionsToProps = {
    setAllProposals,
    setProposals,
};

export default connect(stateToProps, actionsToProps)(Govern);
