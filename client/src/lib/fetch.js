import axios from "axios";
import { toast } from "react-toastify";

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

export const HttpRequestNew = async ({
  method,
  url,
  axiosInstance,
  header = {},
  data = null,
  controller = new AbortController(),
  alert = false,
  timeout = 0,
}) => {
  if (timeout !== 0) await delay(timeout);

  return await axiosInstance({
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

// axiosRetry(axios, {
//   retries: 1,
//   retryCondition: async (error) => {
//     if (
//       error.config.url !== import.meta.env.VITE_ENDPOINT_REFRESH &&
//       error.response.status === 401 &&
//       localStorage.getItem("refreshToken")
//     ) {
//       refreshToken()
//         .then((data) => {
//           error.config.headers["Authorization"] =
//             "Bearer " + data.data.accessToken;
//           localStorage.setItem("accessToken", data.data.accessToken);
//           localStorage.setItem("refreshToken", data.data.refreshToken);
//           return true;
//         })
//         .catch((err) => {
//           console.log(err);
//           forceSignin();
//         });
//     }
//     return false;
//   },
// });

// const forceSignin = () => {
//   const navigate = useNavigate();
//   const [accessToken, setAccessToken] = useLocalStorage("accessToken");
//   const [refreshToken, setRefreshToken] = useLocalStorage("refreshToken");
//   setAccessToken(undefined);
//   setRefreshToken(undefined);
//   navigate("/auth");
// };

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
