export const getQuery = async (url:string, method:string) => {
  try {
    const result:any = await fetch({
      url,
      method: method || "get",
      //@ts-ignore
      headers: { "content-type": `application/json` },
    });
    return result.data;
  } catch (err) {
    return null;
  }
};
