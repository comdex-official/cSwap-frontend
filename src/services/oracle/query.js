import axios from "axios";
import { API_URL } from "../../constants/url";

export const fetchRestPrices = (callback) => {
  axios
    .get(`${API_URL}/api/v2/cswap/tokens/all`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};
