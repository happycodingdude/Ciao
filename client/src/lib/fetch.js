import axios from "axios";
import axiosRetry from "axios-retry";
import { toast } from "react-toastify";
import refreshToken from "../features/authentication/services/refreshToken";

function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export const HttpRequestNoRetry = async ({
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
  retryCondition: (error) => {
    if (
      error.config.url !== import.meta.env.VITE_ENDPOINT_REFRESH &&
      error.response?.status === 401 &&
      localStorage.getItem("refreshToken")
    ) {
      return refreshToken()
        .then((data) => {
          // Update the failed request's config with the new token
          error.config.headers["Authorization"] =
            "Bearer " + data.data.accessToken;
          // setAccessToken(data.data.accessToken);
          // setRefreshToken(data.data.refreshToken);
          // setUserId(data.data.userId);

          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("refreshToken", data.data.refreshToken);
          localStorage.setItem("userId", data.data.userId);

          // Retry the request
          return true;
        })
        .catch((err) => {
          console.error("Failed to refresh token:", err);
          // setAccessToken(undefined);
          // setRefreshToken(undefined);
          // setUserId(undefined);

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");

          // Navigate back to the login page
          // navigate("/auth");
          window.location.href = "/auth";
          return false;
        });
    }
    return false; // No retry if condition not met
  },
});

const HttpRequest = async ({
  method,
  url,
  // axiosInstance,
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

export default HttpRequest;
