import axios from "axios";

export const ibcAssets = async () => {
  let url: any = process.env.NEXT_PUBLIC_ASSET_LIST_URL;
  try {
    const result = await axios.get(url);
    return result?.data;
  } catch (error) {
    return error;
  }
};