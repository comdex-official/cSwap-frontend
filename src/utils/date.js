import moment from "moment";

export const formatTime = (time) => {
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
};

export const getDuration = (end, start) => {
    return moment(end).diff(moment(start), "days"); // 1
};
