import { Navigate, Outlet } from "react-router-dom";
import { useInfo } from "../hook/CustomHooks";

const ProtectedRoute = () => {
  const { data: user, isLoading } = useInfo();

  //   const { setLoading } = useLoading();

  if (isLoading) {
    // setLoading(true);
    return;
  }

  //   setLoading(false);
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/auth" state={{ signedOut: true }} />
  );
};

export default ProtectedRoute;
