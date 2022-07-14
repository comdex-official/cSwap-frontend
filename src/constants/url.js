export const getPriceChartURL = (range) => {
  return `https://api-osmosis.imperator.co/tokens/v2/historical/CMDX/chart?tf=${range}`;
};

// tf = range 60- 1H, 1440 - 1D, 10080 - 1W,  43800 - 1M
export const CAMPAIGN_URL = "https://test-campaign.comdex.one";
