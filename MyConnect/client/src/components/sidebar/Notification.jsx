import React, { useCallback, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useEventListener,
  useFetchNotifications,
} from "../../hook/CustomHooks";
import AcceptButton from "../friend/AcceptButton";

const Notification = () => {
  const { token } = useAuth();
  const { notifications, setNotifications, reFetchNotifications } =
    useFetchNotifications();

  const refNotification = useRef();
  const refNotificationBody = useRef();
  const [loaded, setLoaded] = useState(false);

  const showNotification = useCallback(() => {
    if (!loaded) {
      reFetchNotifications();
      setLoaded(true);
      refNotificationBody.current.scrollTop = 0;
    }
    refNotification.current.setAttribute("data-state", "show");
  }, [loaded]);

  // Event listener
  const hideNotificationOnClick = useCallback((e) => {
    if (
      Array.from(e.target.classList).includes("notification-trigger") ||
      Array.from(e.target.classList).includes("notification-body") ||
      Array.from(e.target.classList).includes("button-title")
    )
      return;
    refNotification.current.setAttribute("data-state", "hide");
    setLoaded(false);
  }, []);
  useEventListener("click", hideNotificationOnClick);
  const hideNotificationOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      refNotification.current.setAttribute("data-state", "hide");
      setLoaded(false);
    }
  }, []);
  useEventListener("keydown", hideNotificationOnKey);

  const read = (e, notification) => {
    if (notification.read) return;
    const isClickOnButton =
      Array.from(e.target.classList).includes("button-title") ||
      Array.from(e.target.classList).includes("accept-button");
    const body = [
      {
        op: "replace",
        path: "read",
        value: true,
      },
    ];

    HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GETBYID.replace(
        "{id}",
        notification.id,
      ),
      token: token,
      data: body,
    }).then((res) => {
      setNotifications((current) => {
        return current.map((item) => {
          if (item.id === notification.id) item.read = true;
          if (isClickOnButton) item.sourceData = null;
          return item;
        });
      });
    });
  };

  const readAll = () => {
    if (notifications.some((item) => !item.Read)) {
      const body = notifications
        .filter((item) => !item.Read)
        .map((item) => {
          return {
            Id: item.Id,
            PatchDocument: [
              {
                op: "replace",
                path: "Read",
                value: true,
              },
            ],
          };
        });
      HttpRequest({
        method: "patch",
        url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_BULKEDIT,
        token: token,
        data: body,
      }).then((res) => {
        setNotifications((current) => {
          return current.map((item) => {
            item.Read = true;
            return item;
          });
        });
      });
    }
  };

  return (
    <div
      className="fa fa-bell notification-trigger relative cursor-pointer text-xl font-thin"
      onClick={showNotification}
    >
      {/* <div className="absolute right-0 top-[-10%] aspect-square w-[1rem] rounded-[50%] bg-red-500"></div> */}
      <div
        ref={refNotification}
        data-state="hide"
        className="notification-body data-[state=show]:scale-1 absolute bottom-[100%] left-[100%] z-[1000] flex w-[30rem] origin-bottom-left cursor-auto flex-col 
        rounded-r-2xl rounded-tl-2xl bg-[var(--bg-color)] text-base shadow-[-5px_5px_20px_-10px_var(--shadow-color)]
        transition-all duration-200 data-[state=hide]:scale-0 laptop:h-[35rem] [&>*]:font-sans"
      >
        <div className="notification-body flex justify-between p-4 shadow-[0px_3px_10px_-10px]">
          <p className="notification-body text-md font-bold">Notifications</p>
          <div
            className="notification-body cursor-pointer text-sm font-normal text-[var(--main-color-medium)]"
            onClick={() => readAll()}
          >
            Mark all as read
          </div>
        </div>
        <div
          ref={refNotificationBody}
          className="notification-body hide-scrollbar flex grow flex-col overflow-y-scroll scroll-smooth [&>*]:p-4"
        >
          {notifications?.map((notification) => (
            <div
              className="notification-body border-b-[var(--border-color) flex cursor-pointer flex-wrap items-center justify-between gap-y-2 border-b-[.1rem] hover:bg-[var(--main-color-thin)]"
              onClick={(e) => read(e, notification)}
            >
              <div className="notification-body py-2 font-normal">
                {notification.content}
              </div>
              {notification.read ? (
                ""
              ) : (
                <div className="notification-body aspect-square w-[1rem] shrink-0 rounded-[50%] bg-[var(--main-color)]"></div>
              )}

              {notification.sourceData === null ||
              notification.sourceData.Status === "friend" ? (
                ""
              ) : (
                <div className="notification-body flex w-full gap-[1rem]">
                  <AcceptButton
                    className="notification-body accept-button !m-0 w-auto px-[1rem] text-xs laptop:h-[2rem]"
                    id={notification.sourceId}
                    onClose={() => {}}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
