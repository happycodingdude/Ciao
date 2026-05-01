import { BellOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import useEventListener from "../../hooks/useEventListener";
import useNotification from "../../hooks/useNotification";
import { read, readAll } from "../../services/notification.service";

const Notification = () => {
  const { data: notifications, refetch } = useNotification();

  const refNotification = useRef<HTMLDivElement>(null);
  const refNotificationBody = useRef<HTMLDivElement>(null);

  const [loaded, setLoaded] = useState(false);

  const showNotification = useCallback(() => {
    if (!loaded) {
      refetch();
      setLoaded(true);
      if (refNotificationBody.current) refNotificationBody.current.scrollTop = 0;
    }
    refNotification.current?.setAttribute("data-state", "show");
  }, [loaded]);

  const hideNotificationOnClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (
      Array.from(target.classList).includes("notification-trigger") ||
      Array.from(target.classList).includes("notification-body") ||
      Array.from(target.classList).includes("button-title")
    )
      return;
    refNotification.current?.setAttribute("data-state", "hide");
    setLoaded(false);
  }, []);
  useEventListener("click", hideNotificationOnClick);

  const hideNotificationOnKey = useCallback((e: Event) => {
    if ((e as KeyboardEvent).key === "Escape") {
      refNotification.current?.setAttribute("data-state", "hide");
      setLoaded(false);
    }
  }, []);
  useEventListener("keydown", hideNotificationOnKey);

  const { mutate: readMutation } = useMutation({
    mutationFn: (id: string) => read(id),
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: readAllMutation } = useMutation({
    mutationFn: readAll,
    onSuccess: () => {
      refetch();
    },
  });

  const readAllCTA = () => {
    if (!notifications?.some((item) => !item.read)) return;
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
            className={`${(notifications?.filter((item) => !item.read).length ?? 0) < 10 ? "text-sm" : "text-xs"}  font-bold text-[var(--sub-color)]`}
          >
            {notifications?.filter((item) => !item.read).length}
          </p>
        </div>
      ) : (
        ""
      )}
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
              key={notification.id}
              className="notification-body flex cursor-pointer items-center justify-between gap-y-2 hover:bg-[var(--bg-color-extrathin)]"
              onClick={() => {
                if (notification.read) return;
                readMutation(notification.id ?? "");
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
