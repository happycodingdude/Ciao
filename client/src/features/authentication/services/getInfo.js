import { HttpRequestNew } from "../../../lib/fetch";

const getInfo = async (axios) => {
  return (
    await HttpRequestNew({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INFO,
      axiosInstance: axios,
      // timeout: 1000,
    })
  ).data;
};
export default getInfo;
