import { COMPLETE_SET } from "../constants/farm";

export const setComplete = (value) => {
  return {
    type: COMPLETE_SET,
    value,
  };
};
