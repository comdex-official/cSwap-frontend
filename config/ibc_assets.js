import axios from 'axios';

export const ibcAssets = async () => {
  let url = process.env.NEXT_PUBLIC_ASSET_LIST_URL;
  try {
    const result = await axios.get(url);
    return result?.data;
  } catch (error) {
    return error;
  }
};
