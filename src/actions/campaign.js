import axios from "axios";
import { message } from "antd";
import { CAMPAIGN_URL } from "../constants/url";

export const fetchCampaignStats = (address, callback) => {
  let url = `${CAMPAIGN_URL}/stats/${address}`;
  const headers = {
    "Content-Type": "application/json",
  };

  axios
    .get(url, {
      headers,
    })
    .then((response) => {
      callback(null, response.data);
    })
    .catch((error) => {
      message.error(error?.message);
      callback(error?.message);
    });
};

export const updateCampaignStats = (walletAddress, flagType, callback) => {
  let url = `${CAMPAIGN_URL}/externals/`;
  const headers = {
    "Content-Type": "application/json",
  };

  axios
    .post(
      url,
      {
        walletAddress,
        flagType,
      },
      {
        headers,
      }
    )
    .then((response) => {
      callback(null, response.data);
    })
    .catch((error) => {
      message.error(error?.message);
      callback(error?.message);
    });
};
