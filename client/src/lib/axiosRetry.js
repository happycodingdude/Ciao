import axiosRetry from "axios-retry";
import refreshToken from "../features/authentication/services/refreshToken";

const setupAxiosRetry = (
  axiosInstance,
  navigate,
  setAccessToken,
  setRefreshToken,
  setUserId,
) => {
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
            setAccessToken(data.data.accessToken);
            setRefreshToken(data.data.refreshToken);
            setUserId(data.data.userId);

            // Retry the request
            return true;
          })
          .catch((err) => {
            console.error("Failed to refresh token:", err);
            setAccessToken(undefined);
            setRefreshToken(undefined);
            setUserId(undefined);

            // Navigate back to the login page
            navigate("/auth");
            return false;
          });
      }
      return false; // No retry if condition not met
    },
  });
};

export default setupAxiosRetry;
