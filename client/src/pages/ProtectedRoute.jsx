import { Navigate, Outlet } from "react-router-dom";
import Loading from "../components/Loading";
import useInfo from "../features/authentication/hooks/useInfo";
import useLocalStorage from "../hooks/useLocalStorage";

const ProtectedRoute = () => {
  const { data: info } = useInfo(true);
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
