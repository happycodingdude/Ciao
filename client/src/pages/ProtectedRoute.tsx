import { Navigate, Outlet } from "react-router-dom";
import LocalLoading from "../components/common/LocalLoading";
import useInfo from "../hooks/useInfo";
import useLocalStorage from "../hooks/useLocalStorage";

const ProtectedRoute = () => {
  const { data: info } = useInfo(true);
  // const [accessToken] = useLocalStorage("accessToken");
  const [accessToken] = useLocalStorage<string>("accessToken", "");

  if (info) {
    return <Outlet />;
  }

  if (accessToken) {
    return <LocalLoading />;
  } else {
    return <Navigate to="/auth" />;
  }
};

export default ProtectedRoute;
