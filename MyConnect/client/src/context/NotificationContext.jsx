import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const NotificationContext = createContext({});

const page = 1;
const limit = 10;

export const NotificationProvider = ({ children }) => {
  console.log("NotificationProvider rendering");

  const { token } = useAuth();
  const [notifications, setNotifications] = useState();

  const getNotifications = useCallback(() => {
    HttpRequest({
      method: "get",
      url: `api/notifications?page=${page}&limit=${limit}`,
      token: token,
    }).then((res) => {
      setNotifications(res);
    });
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        reFetchNotifications: getNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
