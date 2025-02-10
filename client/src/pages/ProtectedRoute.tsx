import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import LocalLoading from "../components/LocalLoading";
import useInfo from "../features/authentication/hooks/useInfo";
import useLocalStorage from "../hooks/useLocalStorage";

const ProtectedRoute = () => {
  const { data: info } = useInfo(true);
  const [accessToken] = useLocalStorage("accessToken");

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
