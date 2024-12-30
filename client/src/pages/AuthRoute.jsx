import { Navigate, Outlet, useLocation } from "react-router-dom";
import RefreshToken from "../features/authentication/components/RefreshToken";
import useInfo from "../features/authentication/hooks/useInfo";

const AuthRoute = () => {
  const location = useLocation();
  const signedOut = location.state?.signedOut || false;
  const { data: user } = useInfo(signedOut);

  // const { setLoading } = useLoading();

  // if (error?.response.status === 401) {
  if (!user) {
    // setLoading(true);
    return <RefreshToken />;
  }

  // setLoading(false);
  return user ? <Navigate to="/" /> : <Outlet />;
};

export default AuthRoute;
