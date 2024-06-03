import axios from "axios";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hook/CustomHooks";

// const navigate = useNavigate();

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
      if (alert) toast("😎 Mission succeeded!");
      return res;
    })
    .catch((err) => {
      if (alert) toast("👨‍✈️ Mission failed!");
      console.log(err);
      // if (err.response?.status === 401) navigate("/authen", { replace: true });

      throw err.response;
      // return err;
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
