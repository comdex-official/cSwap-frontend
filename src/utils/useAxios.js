export const getQuery = async (url, method) => {
  try {
    const result = await fetch({
      url,
      method: method || "get",
      headers: { "content-type": "application/json" },
    });
    return result.data;
  } catch (err) {
    return null;
  }
};
