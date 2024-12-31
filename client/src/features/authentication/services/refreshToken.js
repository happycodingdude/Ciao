import { HttpRequestNoRetry } from "../../../lib/fetch";

const refreshToken = async () => {
  return await HttpRequestNoRetry({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_REFRESH,
    data: {
      userId: localStorage.getItem("userId"),
      refreshToken: localStorage.getItem("refreshToken"),
    },
  });
};

export default refreshToken;
