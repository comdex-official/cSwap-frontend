import axios from 'axios';
import { API_URL } from '../../constants/url';

export const fetchRestPrices = (callback) => {
  axios
    .get(`https://srinu-assets.comdex.one/devnet_ibc_assets.json`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};

export const fetchRestLPPrices = (callback) => {
  axios
    .get(`${API_URL}/api/v2/cswap/lp/prices`)
    .then((result) => {
      callback(null, result?.data);
    })
    .catch((error) => {
      callback(error?.message);
    });
};
