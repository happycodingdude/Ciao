import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useInfo } from "../hook/CustomHooks";

const AuthRoute = () => {
  const location = useLocation();
  const signedOut = location.state?.signedOut || false;
  const { data: user, isLoading } = useInfo(signedOut);

  //   const { setLoading } = useLoading();

  if (isLoading) {
    // setLoading(true);
    return;
  }

  //   setLoading(false);
  return user ? <Navigate to="/" /> : <Outlet />;
};

export default AuthRoute;
