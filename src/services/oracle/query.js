import axios from "axios";
import { API_URL } from "../../constants/url";

export const fetchRestPrices = (callback) => {
  axios
    .get(`${API_URL}/cswap/prices`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchCMSTPrice = (callback) => {
  axios
    .get(`${API_URL}/cmst/price`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};
