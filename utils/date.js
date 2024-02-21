import moment from "moment";

export const formatTime = (time) => {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};
