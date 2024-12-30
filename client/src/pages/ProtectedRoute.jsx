import { Navigate, Outlet } from "react-router-dom";
import Loading from "../components/Loading";
import useInfo from "../features/authentication/hooks/useInfo";
import useAxiosRetry from "../hooks/useAxiosRetry";
import useLocalStorage from "../hooks/useLocalStorage";

const ProtectedRoute = () => {
  const axios = useAxiosRetry();
  const { data: info } = useInfo(true, axios);
  const [accessToken] = useLocalStorage("accessToken");

  if (info) {
    return <Outlet />;
  }

  if (accessToken) {
    return <Loading />;
  } else {
    return <Navigate to="/auth" />;
  }
};

export default ProtectedRoute;
