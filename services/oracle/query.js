import axios from 'axios';
import { API_URL } from '../../constants/url';
import { envConfigResult } from '@/config/envConfig';


export const fetchRestPrices = async (callback) => {
  const comdex = await envConfigResult();
  axios
    .get(`${comdex?.envConfig?.apiUrl}/api/v2/cswap/tokens/all`)
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
