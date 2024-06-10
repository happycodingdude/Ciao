import axios from "axios";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useInfo } from "../hook/CustomHooks";

export const RequireAuth = () => {
  const { data: info, isLoading } = useInfo();

  if (isLoading) return "Loading...";

  if (!info) return <Navigate to="/authen" replace />;

  return <Outlet />;
};

export const HttpRequest = ({
  method,
  url,
  token,
  header = {},
  data = null,
  controller = new AbortController(),
  alert = false,
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
      if (alert) toast.success("😎 Mission succeeded!");
      return res;
    })
    .catch((err) => {
      if (alert) toast.error("👨‍✈️ Mission failed!");
      console.log(err);

      throw err.response;
    });
};

export const GenerateContent = (contacts, text) => {
  if (contacts?.some((item) => text.includes(`@${item.ContactId}`))) {
    contacts.map((item) => {
      text = text.replace(
        `@${item.ContactId}`,
        `<span className="text-blue-400 cursor-pointer">${item.Name}</span>`,
      );
    });
    return parse(text);
  }
  return text;
};
