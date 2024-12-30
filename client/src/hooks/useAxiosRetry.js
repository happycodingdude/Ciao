import axios from "axios";
import axiosRetry from "axios-retry";
import { useNavigate } from "react-router-dom";
import refreshToken from "../features/authentication/services/refreshToken";

const axiosInstance = axios.create();

const setupAxiosRetry = (navigate) => {
  axiosRetry(axiosInstance, {
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
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            localStorage.setItem("userId", data.data.userId);

            // Retry the request
            return true;
          })
          .catch((err) => {
            console.error("Failed to refresh token:", err);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");

            // Navigate back to the login page
            navigate("/auth");
            return false;
          });
      }
      return false; // No retry if condition not met
    },
  });
};

const useAxiosRetry = () => {
  const navigate = useNavigate();

  // Setup axios retry with navigate reference
  setupAxiosRetry(navigate);

  return axiosInstance;
};

export default useAxiosRetry;
