// import style from "./Govern.moduleOld.scss";
import { useRouter } from "next/router";
import { Button, List, Spin } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Link from "next/link";
import Copy from "../../shared/components/Copy";
import VoteNowModal from "./VoteNowModal";
import * as PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Progress } from "@mantine/core";
import {
    setProposal,
    setProposalTally,
    setProposer,
} from "../../actions/govern";
import { comdex } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import {
    fetchRestBondexTokens,
    fetchRestProposal,
    fetchRestProposalTally,
    fetchRestProposer,
    fetchRestTallyParamsProposer,
    queryUserVote,
} from "../../services/govern/query";
import { amountConversion, denomConversion, fixedDecimal } from "../../utils/coin";
import { formatTime } from "../../utils/date";
import { formatNumber } from "../../utils/number";
import {
    proposalOptionMap,
    proposalStatusMap,
    stringTagParser,
    truncateString,
} from "../../utils/string";
import moment from "moment";

const GovernViewPage = ({
    address,
    setProposal,
    proposalMap,
    setProposer,
    proposerMap,
    setProposalTally,
    proposalTallyMap,

}) => {
    const router = useRouter();

    const [tallyParams, setTallyParams] = useState();
    const [bondedTokens, setBondedTokens] = useState();


    const { id } = router.query;
    const [inProgress, setInProgress] = useState(false);


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
            counts: proposal?.voting_start_time
                ? formatTime(proposal?.voting_start_time)
                : "--/--/-- 00:00:00",
        },
        {
            title: "Voting Ends",
            counts: proposal?.voting_end_time
                ? formatTime(proposal?.voting_end_time)
                : "--/--/-- 00:00:00",
        },
        {
            title: "Proposer",
            counts: (
                <>
                    {proposer ? (
                        <p className="wrap__proposer">
                            <span className="mr-1">{truncateString(proposer, 6, 6)}</span>
                            <Copy text={proposer} />
                        </p>
                    ) : (
                        "------"
                    )}
                </>
            ),
        },
    ];

    const fetchTallyParamsProposer = useCallback(() => {
        setInProgress(true);
        fetchRestTallyParamsProposer((error, result) => {
            setInProgress(false);
            if (error) {
                message.error(error);
                return;
            }
            setTallyParams(result)
        });
    }, []);

    const fetchBondexTokens = useCallback(() => {
        setInProgress(true);
        fetchRestBondexTokens((error, result) => {
            setInProgress(false);
            if (error) {
                message.error(error);
                return;
            }
            setBondedTokens(result)
        });
    }, []);


    const calculateQuoremThreshold = () => {
        let bondedToken = bondedTokens?.pool?.bonded_tokens;
        let quorem = tallyParams?.tally_params?.quorum;
        let calculateQuoremThreshold = bondedToken * quorem;
        calculateQuoremThreshold = formatNumber(amountConversion(calculateQuoremThreshold || 0))
        return calculateQuoremThreshold;
    }

    const calculateCurrentThreshold = () => {
        let yes = Number(proposalTally?.yes);
        let no = Number(proposalTally?.no);
        let veto = Number(proposalTally?.no_with_veto);
        let abstain = Number(proposalTally?.abstain);

        let totalValue = yes + no + abstain + veto;

        let bondedToken = bondedTokens?.pool?.bonded_tokens;
        let quorem = tallyParams?.tally_params?.quorum;
        let calculateQuoremThreshold = bondedToken * quorem;


        totalValue = amountConversion(totalValue || 0);
        calculateQuoremThreshold = amountConversion(calculateQuoremThreshold || 0);

        let calculateCurrentThresholdData = (Number(totalValue) / Number(calculateQuoremThreshold)) * 100;
        if (isNaN(calculateCurrentThresholdData) || calculateCurrentThresholdData == "Infinity") {
            return 0
        }
        if (Number(calculateCurrentThresholdData) > 100) {
            calculateCurrentThresholdData = 100;
        }
        return fixedDecimal(calculateCurrentThresholdData || 0);


    }

    useEffect(() => {
        fetchTallyParamsProposer()
        fetchBondexTokens()
    }, [])


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    useEffect(() => {
        setInProgress(true);
        if (id) {
            fetchRestProposal(id, (error, result) => {
                if (error) {
                    return;
                }
                setInProgress(false);
                setProposal(result?.proposal);
            });
            fetchRestProposalTally(id, (error, result) => {
                if (error) {
                    return;
                }

                setProposalTally(result?.tally, id);
            });

            fetchRestProposer(id, (error, result) => {
                if (error) {
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

    const Options = {
        chart: {
            type: "pie",
            backgroundColor: null,
            height: 180,
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
                size: "105%",
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

    if (inProgress) {
        return <div className="no_data"> <Spin /></div>
    }

    return (
        <>
            <div className="proposal_view_back_button_container mt-4">
                <Link href="/govern">
                    <Button type="primary">Back</Button>
                </Link>
            </div>

            <div className="govern_view_main_container mt-4 ">
                <div className="govern_view_container">

                    <div className="proposal_detail_main_container">
                        <div className="proposal_detail_container">
                            <div className="proposal_id"> #{proposal?.proposal_id || "-"}</div>
                            <div className="proposal_title">{proposal?.content?.title || "------"}</div>
                            <div className="proposal_overview_container">
                                <div className="proposal_stats_container">
                                    <div className="title">Voting Starts</div>
                                    <div className="value">{
                                        proposal?.voting_start_time
                                            ? moment(proposal?.voting_start_time).format("DD-MM-YYYY")
                                            : "--/--/--"
                                    }</div>
                                </div>
                                <div className="proposal_stats_container">
                                    <div className="title">Voting Ends</div>
                                    <div className="value">
                                        {
                                            proposal?.voting_end_time
                                                ? moment(proposal?.voting_end_time).format("DD-MM-YYYY")
                                                : "--/--/--"
                                        }
                                    </div>
                                </div>
                                <div className="proposal_stats_container">
                                    <div className="title">Proposer</div>
                                    <div className="value">{truncateString(proposer, 6, 6)}</div>
                                </div>
                                <div className="proposal_stats_container">
                                    <div className="title">My Voting power</div>
                                    <div className="value">0 CMDX</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="proposal_vote_details_main_container">

                        <div className="proposal_vote_details_container">
                            <div className="title_and_user_vote_container">
                                <div className="vote_title">Vote Details</div>
                                {/* <div className="user_vote">Your Vote: <span>Yes</span></div> */}
                                <div className="user_vote"> {proposalOptionMap?.[votedOption] && (
                                    <span>
                                        Your Vote :{" "}
                                        <span> {proposalOptionMap[votedOption]}</span>
                                    </span>
                                )}</div>

                            </div>
                            <div className="proposal_vote_details_main">

                                <div className="proposal_vote_column">
                                    <div className="total_votel_container">
                                        <div className="title">Total Votes</div>
                                        <div className="value">
                                            <div >
                                                {`${calculateTotalValue() || "0"
                                                    } ${denomConversion(comdex?.coinMinimalDenom)}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="proposal_quorem_container">
                                        <div className="total_quorem">
                                            <div className="title">Current Quorum</div>
                                            {/* <div className="title">Current Quorum: {calculateCurrentThreshold() || 0} %</div> */}
                                            {/* <div className="value">{calculateQuoremThreshold() || 0} CMDX</div> */}
                                            <div className={calculateCurrentThreshold() < 100 ? "value error-color" : "value green-color"}> {calculateCurrentThreshold() || 0} %</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="proposal_vote_detail_column">
                                    <div className="proposal_vote_up_row">
                                        <div className="stata_main_container">
                                            <div className="stats_container">
                                                <div className="color" style={{ backgroundColor: "#52B788" }}></div>
                                                <div className="data_container">
                                                    <div className="title">Yes</div>
                                                    <div className="value"> {Number(getVotes?.yes || "0.00")}%</div>
                                                </div>
                                            </div>
                                            <div className="stats_container">
                                                <div className="color" style={{ backgroundColor: "#D74A4A" }}></div>
                                                <div className="data_container">
                                                    <div className="title">No</div>
                                                    <div className="value"> {Number(getVotes?.no || "0.00")}%</div>
                                                </div>
                                            </div>
                                            <div className="stats_container">
                                                <div className="color" style={{ backgroundColor: "#C2A3A3" }}></div>
                                                <div className="data_container">
                                                    <div className="title">No With Veto</div>
                                                    <div className="value">{Number(getVotes?.veto || "0.00")}%</div>
                                                </div>
                                            </div>
                                            <div className="stats_container">
                                                <div className="color" style={{ backgroundColor: "#9FA4AD" }}></div>
                                                <div className="data_container">
                                                    <div className="title">Abstain</div>
                                                    <div className="value">{Number(getVotes?.abstain || "0.00")}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="proposal_vote_botom_row">
                                        <div className="mt-3 mask_container_relative">
                                            <div>
                                                <Progress
                                                    className="vote-progress-bar"
                                                    radius="xl"
                                                    size={10}
                                                    sections={[
                                                        {
                                                            value: Number(getVotes?.yes || 0),
                                                            color: "#52B788",
                                                            tooltip: `Yes ${Number(getVotes?.yes || 0)} %`,
                                                        },
                                                        {
                                                            value: Number(getVotes?.no || 0),
                                                            color: "#D74A4A",
                                                            tooltip: `No ${Number(getVotes?.no || 0)} %`,
                                                        },
                                                        {
                                                            value: Number(getVotes?.veto || 0),
                                                            color: "#C2A3A3",

                                                            tooltip: `No With Veto ${Number(getVotes?.veto || 0)} %`,
                                                        },
                                                        {
                                                            value: Number(getVotes?.abstain || 0),
                                                            color: "#9FA4AD",

                                                            tooltip: `Abstain ${Number(getVotes?.abstain || 0)} %`,
                                                        },
                                                    ]}
                                                />
                                            </div>
                                            <div className="mask_container">
                                                {/* <div className="quorem_container">
                                                    <div className="line"></div>
                                                    <div className="arrow">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                                                            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="value">Quorum: 33%</div>
                                                </div> */}

                                                {/* <div className="quorem_container threshold_container">
                                                    <div className="line"></div>
                                                    <div className="arrow">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                                                            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="value">Threshold: 50%</div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="proposal_vote_btn_container">
                                    {/* <Button type="primary" className="btn-filled"> Vote</Button> */}
                                    <VoteNowModal
                                        refreshVote={fetchVote}
                                        proposal={proposal}
                                    />
                                </div>


                            </div>
                        </div>
                    </div>

                    <div className="proposal_description_main_container">
                        <div className="proposal_heading">
                            Description
                        </div>
                        <div className="proposal_para">
                            {stringTagParser(proposal?.content?.description || " ")}
                        </div>

                        <div className="proposal_suggest_box">
                            <p>No other parameters are being changed.</p>
                            <p>  Vote <span>YES</span>  to approve the increase of debt ceiling.</p>
                            <p> Vote <span>NO</span>  to disapprove the increase of debt ceiling.</p>
                            <p>  Vote <span>ABSTAIN</span>  to express no interest in the proposal.</p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

GovernViewPage.propTypes = {
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

export default connect(stateToProps, actionsToProps)(GovernViewPage)