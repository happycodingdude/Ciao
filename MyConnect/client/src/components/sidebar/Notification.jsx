import React, { useCallback, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useEventListener,
  useFetchNotifications,
} from "../../hook/CustomHooks";

const Notification = () => {
  const { token } = useAuth();
  const { notifications, setNotifications, reFetchNotifications } =
    useFetchNotifications();

  const refNotification = useRef();
  const [loaded, setLoaded] = useState(false);

  const showNotification = useCallback(() => {
    if (!loaded) {
      reFetchNotifications();
      setLoaded(true);
    }
    refNotification.current.setAttribute("data-state", "show");
  }, [loaded]);

  // Event listener
  const hideNotificationOnClick = useCallback((e) => {
    if (
      Array.from(e.target.classList).some(
        (item) => item === "notification-trigger",
      ) ||
      Array.from(e.target.classList).some(
        (item) => item === "notification-body",
      )
    )
      return;
    refNotification.current.setAttribute("data-state", "hide");
    setLoaded(false);
  }, []);
  const hideNotificationOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      refNotification.current.setAttribute("data-state", "hide");
      setLoaded(false);
    }
  }, []);
  useEventListener("keydown", hideNotificationOnKey);
  useEventListener("click", hideNotificationOnClick);

  const read = (id) => {
    const body = [
      {
        op: "replace",
        path: "Read",
        value: true,
      },
    ];

    HttpRequest({
      method: "patch",
      url: `api/notifications/${id}`,
      token: token,
      data: body,
    }).then((res) => {
      setNotifications((current) => {
        return current.map((item) => {
          if (item.Id === id) item.Read = true;
          return item;
        });
      });
    });
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
        className="notification-body data-[state=show]:scale-1 absolute bottom-[100%] left-[100%] z-[1000] flex h-[20rem] w-[30rem] origin-bottom-left cursor-auto 
        flex-col gap-[1rem] rounded-r-2xl rounded-tl-2xl bg-[var(--bg-color)] text-base shadow-[-5px_5px_20px_-10px_var(--shadow-color)]
        transition-all duration-200 data-[state=hide]:scale-0 [&>*]:p-2"
      >
        <div className="notification-body flex justify-between">
          <p className="notification-body font-bold">Notification</p>
          <div className="notification-body flex cursor-pointer items-center gap-[.3rem]">
            <div className="aspect-square w-[.3rem] bg-[var(--text-main-color)]"></div>
            <div className="aspect-square w-[.3rem] bg-[var(--text-main-color)]"></div>
            <div className="aspect-square w-[.3rem] bg-[var(--text-main-color)]"></div>
          </div>
        </div>
        <div className="notification-body hide-scrollbar flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth">
          {notifications?.map((item) => (
            <div className="flex items-center justify-between">
              <div
                data-key={item.Id}
                className="notification-body cursor-pointer font-sans font-normal hover:bg-[var(--main-color-thin)]"
                onClick={() => read(item.Id)}
              >
                {item.Content}
              </div>
              {item.Read ? (
                ""
              ) : (
                <div className="aspect-square w-[1rem] rounded-[50%] bg-red-500"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
