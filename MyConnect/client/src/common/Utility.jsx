import axios from "axios";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hook/CustomHooks";

export const RequireAuth = () => {
  const auth = useAuth();
  const location = useLocation();

  return auth.id ? (
    <Outlet />
  ) : (
    <Navigate to="/authen" state={{ from: location }} replace />
  );
};

export const HttpRequest = (method, url, token, controller, data = null) => {
  return axios({
    method: method,
    url: url,
    data: data,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    signal: controller.signal,
  })
    .then((res) => {
      if (res.status !== 200) throw new Error(res.status);
      return res.data.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

export const ApiGet = async (url, token) => {
  const cancelToken = axios.CancelToken.source();
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
  return await axios
    .get(url, {
      cancelToken: cancelToken.token,
      headers: headers,
    })
    .then((res) => {
      if (res.status !== 200) throw new Error(res.status);
      return res.data.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

export const ApiPost = async (url, body, token) => {
  const cancelToken = axios.CancelToken.source();
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
  return await axios
    .post(url, body, {
      cancelToken: cancelToken.token,
      headers: headers,
    })
    .then((res) => {
      if (res.status !== 200) throw new Error(res.status);
      return res.data.data;
    })
    .catch((err) => {
      console.log(err);
    });
};
