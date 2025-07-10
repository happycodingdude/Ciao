import axios from "axios";
import axiosRetry from "axios-retry";
import { toast } from "react-toastify";
import refreshToken from "../features/authentication/services/refreshToken";
import { HttpRequest } from "../types";
import delay from "../utils/delay";

axiosRetry(axios, {
  retries: 1,
  retryCondition: (error) => {
    const baseUrl = import.meta.env.VITE_ASPNETCORE_CHAT_URL;
    const fullRefreshUrl =
      baseUrl + withApiPrefix(import.meta.env.VITE_ENDPOINT_REFRESH); // 👈 tự động chèn prefix
    if (
      error.config.url !== fullRefreshUrl &&
      error.response?.status === 401 &&
      localStorage.getItem("refreshToken")
    ) {
      return refreshToken({
        userId: localStorage.getItem("userId"),
        refreshToken: localStorage.getItem("refreshToken"),
      })
        .then((res) => {
          // Update the failed request's config with the new token
          error.config.headers["Authorization"] = "Bearer " + res.accessToken;

          localStorage.setItem("accessToken", res.accessToken);
          localStorage.setItem("refreshToken", res.refreshToken);
          localStorage.setItem("userId", res.userId);

          // Retry the request
          return true;
        })
        .catch((err) => {
          console.error("Failed to refresh token:", err);

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");

          // Navigate back to the login page
          window.location.href = "/auth";
          return false;
        });
    }
    return false; // No retry if condition not met
  },
});

const withApiPrefix = (endpoint: string): string => {
  const prefix = import.meta.env.VITE_API_PREFIX || "";
  return `${prefix}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
};

const HttpRequest = async <TReq = undefined, TRes = undefined>(
  req: HttpRequest<TReq, TRes>,
) => {
  if (req.timeout !== 0) await delay(req.timeout);

  const baseUrl = import.meta.env.VITE_ASPNETCORE_CHAT_URL;
  const fullUrl = baseUrl + withApiPrefix(req.url); // 👈 tự động chèn prefix

  return await axios<TRes | undefined>({
    method: req.method,
    baseURL: import.meta.env.VITE_ASPNETCORE_CHAT_URL,
    url: fullUrl,
    data: req.data,
    headers: {
      ...{
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "ngrok-skip-browser-warning": "true",
      },
      ...req.headers,
    },
    // signal: req.controller.signal,
  })
    .then((res) => {
      if (req.alert) toast.success("😎 Mission succeeded!");
      return res;
    })
    .catch((err) => {
      if (req.alert) toast.error("👨‍✈️ Mission failed!");
      throw err;
    });
};

export default HttpRequest;
