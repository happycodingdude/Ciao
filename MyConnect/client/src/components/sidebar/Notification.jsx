import React, { useCallback, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useEventListener,
  useFetchNotifications,
} from "../../hook/CustomHooks";
import AcceptButton from "../friend/AcceptButton";
import DenyButton from "../friend/DenyButton";

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

  const readAll = () => {
    const body = notifications.map((item) => {
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
    // console.log(body);
    HttpRequest({
      method: "patch",
      url: `api/notifications/bulk_edit`,
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
  };

  return (
    <div
      className="fa fa-bell notification-trigger relative cursor-pointer text-xl font-thin"
      onClick={showNotification}
    >
      {/* <div className="absolute right-0 top-[-10%] aspect-square w-[1rem] rounded-[50%] bg-red-500"></div> */}
      <div
        ref={refNotification}
        data-state="show"
        className="notification-body data-[state=show]:scale-1 absolute bottom-[100%] left-[100%] z-[1000] flex w-[30rem] origin-bottom-left cursor-auto flex-col 
        rounded-r-2xl rounded-tl-2xl bg-[var(--bg-color)] text-base shadow-[-5px_5px_20px_-10px_var(--shadow-color)]
        transition-all duration-200 data-[state=hide]:scale-0 laptop:h-[35rem]"
      >
        <div className="notification-body flex justify-between p-4 font-sans shadow-[0px_3px_10px_-10px]">
          <p className="notification-body text-md font-bold">Notifications</p>
          {/* <div className="notification-body group relative flex cursor-pointer items-center gap-[.3rem]">
            <div className="aspect-square w-[.2rem] bg-[var(--text-main-color)]"></div>
            <div className="aspect-square w-[.2rem] bg-[var(--text-main-color)]"></div>
            <div className="aspect-square w-[.2rem] bg-[var(--text-main-color)]"></div>
            <div
              className="notification-body absolute bottom-0 left-[100%] flex w-[15rem] origin-bottom-left scale-0 cursor-auto flex-col
              bg-[var(--bg-color)] p-2 shadow-[-5px_5px_20px_-10px_var(--shadow-color)] transition-all duration-200 group-hover:scale-100 [&>*]:px-4 [&>*]:py-2"
            >
              <div
                className="notification-body cursor-pointer hover:bg-[var(--main-color-thin)]"
                onClick={() => readAll()}
              >
                Mark all as read
              </div>
            </div>            
          </div> */}
          <div
            className="notification-body cursor-pointer text-sm font-normal text-[var(--main-color-medium)]"
            onClick={() => readAll()}
          >
            Mark all as read
          </div>
        </div>
        <div className="notification-body hide-scrollbar flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth [&>*]:p-4">
          {notifications?.map((item) => (
            <div className="border-b-[var(--border-color) flex flex-wrap items-center justify-between gap-y-2 border-b-[.1rem] hover:bg-[var(--main-color-thin)]">
              <div
                data-key={item.Id}
                className="notification-body cursor-pointer py-2 font-normal"
                onClick={() => read(item.Id)}
              >
                {item.Content}
              </div>
              {item.Read ? (
                ""
              ) : (
                <div className="notification-body aspect-square w-[1rem] shrink-0 rounded-[50%] bg-[var(--main-color)]"></div>
              )}
              <div className="notification-body flex w-full gap-[1rem]">
                <AcceptButton
                  title="Accept"
                  className="notification-body !m-0 text-xs laptop:h-[2rem] laptop:w-[5rem]"
                  // request={request}
                  // onClose={() => reFetchRequest(profile?.Id)}
                />
                <DenyButton
                  className="notification-body !m-0 text-xs laptop:h-[2rem] laptop:w-[5rem]"
                  // request={request}
                  // onClose={() => reFetchRequest(profile?.Id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
