import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const NotificationContext = createContext({});

const page = 1;
const limit = 10;

export const NotificationProvider = ({ children }) => {
  console.log("NotificationProvider rendering");

  const auth = useAuth();
  const [notifications, setNotifications] = useState();

  const getNotifications = useCallback(
    (controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: `api/notifications?page=${page}&limit=${limit}`,
        token: auth.token,
        controller: controller,
      }).then((res) => {
        setNotifications(res);
      });
    },
    [auth.token],
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, reFetchNotifications: getNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
