import axios from "axios";

export const envConfigResult = async () => {
  let url: any = process.env.NEXT_PUBLIC_CONFIG_JSON_URL;
  try {
    const result = await axios.get(url);
    return result?.data;
  } catch (error) {
    return error;
  }
};