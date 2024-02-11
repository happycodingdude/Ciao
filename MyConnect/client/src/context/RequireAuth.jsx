import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hook/useAuth";

const RequireAuth = () => {
  const auth = useAuth();
  const location = useLocation();

  return auth.id ? (
    <Outlet />
  ) : (
    <Navigate to="/authen" state={{ from: location }} replace />
  );
};

export default RequireAuth;
