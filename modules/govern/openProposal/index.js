import { useRouter } from "next/navigation";
import { Button, List, message, Select, Spin } from "antd";
import * as PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { stringTagParser } from "../../../utils/string";
import { DOLLAR_DECIMALS } from "../../../constants/common";
// import style from "./Govern.moduleOld.scss";
import { Progress } from "@mantine/core";

const { Option } = Select;

const GovernOpenProposal = ({ proposals }) => {
    const router = useRouter();


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


    return (
        <>
            <div className={`mt-4 govern_max_width`}>

                <div className="govern_main_container">
                    <div className="govern_container">
                        <div className="govern_tab_main_container">
                            <div className="govern_tab"></div>
                            <div className="govern_search"></div>
                        </div>
                        {/* ist container start */}
                        <div className="proposal_box_parent_container">

                            {proposals?.length > 0 ?
                                proposals?.map((item) => {
                                    return (
                                        <div className="proposal_main_container" key={item?.proposal_id} onClick={() =>
                                            router.push(`/govern/${item?.proposal_id}`)
                                        } >
                                            <div className="proposal_container">
                                                {/* Id and Timer Container  */}
                                                <div className="id_timer_container">
                                                    <div className="proposal_id">#{item?.proposal_id}</div>
                                                    <div className="proposal_timer">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hourglass-bottom" viewBox="0 0 16 16">
                                                            <path d="M2 1.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1-.5-.5zm2.5.5v1a3.5 3.5 0 0 0 1.989 3.158c.533.256 1.011.791 1.011 1.491v.702s.18.149.5.149.5-.15.5-.15v-.7c0-.701.478-1.236 1.011-1.492A3.5 3.5 0 0 0 11.5 3V2h-7z" />
                                                        </svg>  6d 23h 12m
                                                    </div>
                                                </div>

                                                {/* Title Container  */}

                                                <div className="haeading_container">
                                                    <div className="heading">
                                                        {item?.content?.title}
                                                    </div>
                                                </div>

                                                {/* Pairagraph container  */}
                                                <div className="para_main_container">
                                                    <div className="para_container">
                                                        {stringTagParser(item?.content?.description.substring(0, 150) || " ") + "......"}                                               </div>
                                                </div>

                                                {/* Progress bar container  */}

                                                <div className="progress_bar_main_container">
                                                    <div className="progress_bar_container">
                                                        <div className="stata_main_container">
                                                            <div className="stats_container">
                                                                <div className="color" style={{ backgroundColor: "#52B788" }}></div>
                                                                <div className="data_container">
                                                                    <div className="title">Yes</div>
                                                                    <div className="value">  {`${calculateVotes(
                                                                        item?.final_tally_result?.yes,
                                                                        item?.final_tally_result
                                                                    )}%`}</div>
                                                                </div>
                                                            </div>
                                                            <div className="stats_container">
                                                                <div className="color" style={{ backgroundColor: "#D74A4A" }}></div>
                                                                <div className="data_container">
                                                                    <div className="title">No</div>
                                                                    <div className="value">{`${calculateVotes(
                                                                        item?.final_tally_result?.no,
                                                                        item?.final_tally_result
                                                                    )}%`}</div>
                                                                </div>
                                                            </div>
                                                            <div className="stats_container">
                                                                <div className="color" style={{ backgroundColor: "#C2A3A3" }}></div>
                                                                <div className="data_container">
                                                                    <div className="title">No With Veto</div>
                                                                    <div className="value">  {`${calculateVotes(
                                                                        item?.final_tally_result
                                                                            ?.no_with_veto,
                                                                        item?.final_tally_result
                                                                    )}%`}</div>
                                                                </div>
                                                            </div>
                                                            <div className="stats_container">
                                                                <div className="color" style={{ backgroundColor: "#C58E3D" }}></div>
                                                                <div className="data_container">
                                                                    <div className="title">Abstain</div>
                                                                    <div className="value">   {`${calculateVotes(
                                                                        item?.final_tally_result?.abstain,
                                                                        item?.final_tally_result
                                                                    )}%`}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="progress_bar">
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
                                                                                color: "#52B788",
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
                                                                                color: "#D74A4A",
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
                                                                                color: "#C2A3A3",

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
                                                                                color: "#C58E3D",

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

                                            </div>
                                        </div>
                                    )
                                })
                                : null
                            }
                            {/* 1st container end  */}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
GovernOpenProposal.propTypes = {
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

};

export default connect(stateToProps, actionsToProps)(GovernOpenProposal);
