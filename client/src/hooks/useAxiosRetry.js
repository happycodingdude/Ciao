import axios from "axios";
import { useNavigate } from "react-router-dom";
import setupAxiosRetry from "../lib/axiosRetry";
import useLocalStorage from "./useLocalStorage";

const axiosInstance = axios.create();

const useAxiosRetry = () => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useLocalStorage("accessToken");
  const [refreshToken, setRefreshToken] = useLocalStorage("refreshToken");
  const [userId, setUserId] = useLocalStorage("userId");

  // Setup axios retry with navigate reference
  setupAxiosRetry(
    axiosInstance,
    navigate,
    setAccessToken,
    setRefreshToken,
    setUserId,
  );

  return axiosInstance;
};

export default useAxiosRetry;
