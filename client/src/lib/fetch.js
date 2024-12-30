import axios from "axios";
import axiosRetry from "axios-retry";
import { toast } from "react-toastify";
import refreshToken from "../features/authentication/services/refreshToken";

const HttpRequest = async ({
  method,
  url,
  header = {},
  data = null,
  controller = new AbortController(),
  alert = false,
  timeout = 0,
}) => {
  if (timeout !== 0) await delay(timeout);

  return await axios({
    method: method,
    url: url,
    data: data,
    headers: {
      ...{
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
      ...header,
    },
    signal: controller.signal,
  })
    .then((res) => {
      if (alert) toast.success("😎 Mission succeeded!");
      return res;
    })
    .catch((err) => {
      if (alert) toast.error("👨‍✈️ Mission failed!");
      throw err;
    });
};

axiosRetry(axios, {
  retries: 1,
  retryCondition: async (error) => {
    if (
      error.config.url !== import.meta.env.VITE_ENDPOINT_REFRESH &&
      error.response.status === 401 &&
      localStorage.getItem("refreshToken")
    ) {
      const response = await refreshToken();
      error.config.headers["Authorization"] =
        "Bearer " + response.data.accessToken;
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      return true;
    }
    return false;
  },
});

// const refreshToken = () => {
//   return axios({
//     method: "post",
//     url: import.meta.env.VITE_ENDPOINT_REFRESH,
//     data: {
//       refreshToken: localStorage.getItem("refresh"),
//     },
//   }).then((res) => {
//     localStorage.setItem("token", res.data.accessToken);
//     localStorage.setItem("refresh", res.data.refreshToken);
//     return res.data.accessToken;
//   });
// };

export default HttpRequest;
