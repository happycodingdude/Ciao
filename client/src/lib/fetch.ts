import axios from "axios";
import axiosRetry from "axios-retry";
import { toast } from "react-toastify";
import { refreshToken } from "../services/auth.service";
import type { HttpRequest } from "../types/base.types";
import delay from "../utils/delay";

axiosRetry(axios, {
  retries: 1,
  retryCondition: (error) => {
    const baseUrl = import.meta.env.VITE_ASPNETCORE_CHAT_URL;
    const fullRefreshUrl = baseUrl + withApiPrefix(import.meta.env.VITE_ENDPOINT_REFRESH);

    if (
      // Không retry chính request refresh (tránh vòng lặp vô tận)
      error.config?.url !== fullRefreshUrl &&
      // Chỉ retry khi 401 Unauthorized
      error.response?.status === 401 &&
      // Chỉ thử refresh nếu còn refreshToken trong storage
      localStorage.getItem("refreshToken")
    ) {
      return refreshToken({
        userId: localStorage.getItem("userId") ?? "",
        refreshToken: localStorage.getItem("refreshToken") ?? "",
      })
        .then((res) => {
          // Refresh thất bại (token hết hạn hoặc bị revoke) → không retry
          if (!res) return false;

          // Cập nhật token mới vào header của request đang bị lỗi để retry
          if (error.config?.headers) {
            error.config.headers["Authorization"] = "Bearer " + res.accessToken;
          }

          // Lưu tokens mới vào storage cho các request tiếp theo
          localStorage.setItem("accessToken", res.accessToken);
          localStorage.setItem("refreshToken", res.refreshToken);
          localStorage.setItem("userId", res.userId);

          return true; // Cho phép retry request
        })
        .catch((err) => {
          console.error("Failed to refresh token:", err);

          // Refresh lỗi hẳn → xóa hết credentials và về trang login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");

          window.location.href = "/auth";
          return false;
        });
    }
    return false; // Không đủ điều kiện retry → bỏ qua
  },
});

const withApiPrefix = (endpoint: string): string => {
  const prefix = import.meta.env.VITE_API_PREFIX || "";
  // Đảm bảo endpoint bắt đầu bằng "/" để tránh URL sai khi nối chuỗi
  return `${prefix}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
};

const HttpRequest = async <TReq = undefined, TRes = undefined>(
  req: HttpRequest<TReq, TRes>,
) => {
  // Cho phép delay nhân tạo (dùng trong dev/test để simulate slow network)
  if (req.timeout !== 0) await delay(req.timeout ?? 0);

  const baseUrl = import.meta.env.VITE_ASPNETCORE_CHAT_URL;
  const fullUrl = baseUrl + withApiPrefix(req.url);

  const isFormData = req.data instanceof FormData;

  return await axios<TRes | undefined>({
    method: req.method,
    baseURL: import.meta.env.VITE_ASPNETCORE_CHAT_URL,
    url: fullUrl,
    data: req.data,
    headers: {
      // FormData: để browser tự set Content-Type + boundary; JSON: set tường minh
      ...(isFormData
        ? {}
        : { "Content-Type": "application/json" }),
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
      "ngrok-skip-browser-warning": "true",
      ...req.headers,
    },
  })
    .then((res) => {
      // Hiện toast thành công nếu caller yêu cầu (req.alert = true)
      if (req.alert) toast.success("😎 Mission succeeded!");
      return res;
    })
    .catch((err) => {
      // Hiện toast lỗi nếu caller yêu cầu
      if (req.alert) toast.error("👨‍✈️ Mission failed!");
      throw err;
    });
};

export default HttpRequest;
