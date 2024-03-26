import React, { useCallback, useEffect, useRef } from "react";
import {
  useEventListener,
  useFetchNotifications,
} from "../../hook/CustomHooks";

const Notification = () => {
  const { notifications, reFetchNotifications } = useFetchNotifications();

  const refNotification = useRef();

  useEffect(() => {
    const controller = new AbortController();
    reFetchNotifications(controller);
    return () => {
      controller.abort();
    };
  }, []);

  const showNotification = () => {
    refNotification.current.setAttribute("data-state", "show");
  };

  // Event listener
  const closeNotification = useCallback((e) => {
    if (
      Array.from(e.target.classList).some(
        (item) => item === "notification-trigger",
      ) ||
      Array.from(e.target.classList).some(
        (item) => item === "notification-container",
      )
    ) {
      refNotification.current.setAttribute("data-state", "show");
    } else if (e.keyCode === undefined || e.keyCode === 27) {
      refNotification.current.setAttribute("data-state", "hide");
    }
  }, []);
  useEventListener("keydown", closeNotification);
  useEventListener("click", closeNotification);

  return (
    <div
      className="fa fa-bell notification-trigger relative cursor-pointer text-xl font-thin"
      // onClick={showNotification}
    >
      {/* <div className="absolute right-0 top-[-10%] aspect-square w-[1rem] rounded-[50%] bg-red-500"></div> */}
      <div
        ref={refNotification}
        data-state="hide"
        className="notification-container data-[state=show]:scale-1 absolute bottom-[100%] left-[100%] z-[1000] flex h-[20rem] w-[30rem] origin-bottom-left cursor-auto flex-col
      gap-[1rem] rounded-r-2xl rounded-tl-2xl bg-[var(--bg-color)] text-base shadow-[-5px_5px_20px_-10px_var(--shadow-color)]
      transition-all duration-500 data-[state=hide]:scale-0 [&>*]:p-2"
      >
        <div className="flex justify-between">
          <p className="font-bold">Notification</p>
          <div className="flex items-center gap-[.3rem]">
            <div className="aspect-square w-[.3rem] bg-[var(--text-main-color)]"></div>
            <div className="aspect-square w-[.3rem] bg-[var(--text-main-color)]"></div>
            <div className="aspect-square w-[.3rem] bg-[var(--text-main-color)]"></div>
          </div>
        </div>
        <div className="hide-scrollbar flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth">
          {notifications?.map((item) => (
            <div
              data-key={item.Id}
              className="cursor-pointer font-sans font-normal hover:bg-[var(--main-color-thin)]"
            >
              {item.Content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
