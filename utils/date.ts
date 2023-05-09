import moment from "moment";

export const formatTime = (time :any) => {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
};
