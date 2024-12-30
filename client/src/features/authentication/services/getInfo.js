import HttpRequest from "../../../lib/fetch";

const getInfo = async () => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INFO,
      // timeout: 1000,
    })
  ).data;
};
export default getInfo;
