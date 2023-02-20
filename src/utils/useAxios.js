
export const getQuery = async (url, method) => {
  try {
      console.log('url', url, method)
    const result = await fetch({
      url,
      method: method || "get",
      headers: { "content-type": "application/json" },
    });
    return result.data;
  } catch (err) {
    console.error("axios error at", url, method, err);
    return null;
  }
};
