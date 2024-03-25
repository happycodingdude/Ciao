import axios from "axios";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hook/CustomHooks";

export const RequireAuth = () => {
  const { id } = useAuth();
  const location = useLocation();

  return id ? (
    <Outlet />
  ) : (
    <Navigate to="/authen" state={{ from: location }} replace />
  );
};

export const HttpRequest = ({
  method,
  url,
  token,
  header = {},
  data = null,
  controller = new AbortController(),
}) => {
  return axios({
    method: method,
    url: url,
    data: data,
    headers: {
      ...{
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      ...header,
    },
    signal: controller.signal,
  })
    .then((res) => {
      if (res.status !== 200) throw new Error(res.status);
      return res.data.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

export const GenerateContent = (contacts, text) => {
  if (contacts.some((item) => text.includes(`@${item.Id}`))) {
    contacts.map((item) => {
      text = text.replace(
        `@${item.Id}`,
        `<span className="text-blue-400 cursor-pointer">${item.Name}</span>`,
      );
    });
    return parse(text);
  }
  return text;
};
