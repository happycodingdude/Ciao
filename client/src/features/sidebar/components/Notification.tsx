import { BellOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import useNotification from "../../../hooks/useNotification";
import read from "../../notification/services/read";
import readAll from "../../notification/services/readAll";

const Notification = () => {
  // console.log("Notification calling");

  const { data: notifications, refetch } = useNotification();

  const refNotification = useRef<HTMLDivElement>();
  const refNotificationBody = useRef<HTMLDivElement>();

  const [loaded, setLoaded] = useState(false);

  const showNotification = useCallback(() => {
    if (!loaded) {
      refetch();
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

  const { mutate: readMutation } = useMutation({
    mutationFn: (id: string) => read(id),
    onSuccess: (res) => {
      refetch();
    },
  });

  const { mutate: readAllMutation } = useMutation({
    mutationFn: readAll,
    onSuccess: (res) => {
      refetch();
    },
  });

  const readAllCTA = () => {
    if (!notifications.some((item) => !item.read)) return;
    readAllMutation();
  };

  return (
    <div className="relative">
      {notifications?.some((item) => !item.read) ? (
        <div
          className="absolute right-[-1.5rem] top-[-1.5rem] flex aspect-square w-[2rem] items-center justify-center rounded-[50%] 
        bg-red-500"
        >
          <p
            className={`${notifications?.filter((item) => !item.read).length < 10 ? "text-sm" : "text-xs"}  font-bold text-[var(--sub-color)]`}
          >
            {notifications?.filter((item) => !item.read).length}
          </p>
          {/* <p className={`font-bold text-[var(--sub-color)]`}>
            {notifications?.filter((item) => !item.read).length}
          </p> */}
        </div>
      ) : (
        ""
      )}
      {/* <div
        className="fas fa-bell notification-trigger base-icon-sm"
        onClick={showNotification}
      ></div> */}
      <BellOutlined
        className="notification-trigger base-icon-sm"
        onClick={showNotification}
      />
      <div
        ref={refNotification}
        data-state="hide"
        className="notification-body phone:bottom-[2rem] phone:left-[2rem] phone:h-[25rem] phone:w-[25rem] phone:text-base laptop:bottom-[2rem] 
        laptop:left-[2rem] laptop:h-[30rem] laptop:w-[25rem] laptop:text-md absolute 
          z-[1000] flex 
          origin-bottom-left cursor-auto flex-col rounded-r-2xl rounded-tl-2xl 
          bg-[var(--bg-color-light)] transition-all duration-200 data-[state=hide]:scale-0 data-[state=show]:scale-100"
      >
        <div className="notification-body flex justify-between border-b-[.1rem] border-b-[var(--border-color)] px-4 py-3">
          <p className="notification-body">Notifications</p>
          <div
            className="notification-body cursor-pointer text-[var(--main-color-extrabold)] hover:text-[var(--main-color)]"
            onClick={() => readAllCTA()}
          >
            Mark all as read
          </div>
        </div>
        <div
          ref={refNotificationBody}
          className="notification-body hide-scrollbar flex grow flex-col overflow-y-scroll scroll-smooth text-base [&>*]:px-4 [&>*]:py-2"
        >
          {notifications?.map((notification) => (
            <div
              className="notification-body flex cursor-pointer items-center justify-between gap-y-2 hover:bg-[var(--bg-color-extrathin)]"
              onClick={(e) => {
                if (notification.read) return;
                readMutation(notification.id);
              }}
            >
              <div className="notification-body py-2 font-normal">
                {notification.content}
              </div>
              {notification.read ? (
                ""
              ) : (
                <div className="notification-body aspect-square w-[1rem] shrink-0 rounded-[50%] bg-[var(--main-color)]"></div>
              )}

              {/* {notification.sourceData.friendStatus === "friend" ? (
                ""
              ) : (
                <div className="notification-body flex w-full gap-[1rem]">
                  <AcceptButton
                    className="notification-body accept-button !m-0 w-auto px-[1rem] text-xs laptop:h-[2rem]"
                    id={notification.sourceId}
                    onClose={() => {}}
                  />
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
