import dayjs from "dayjs";
import { NotificationModel } from "../../types/base.types";
import { notificationVisual } from "../../utils/notificationDisplay";

type Props = {
  notification: NotificationModel;
  onOpen: (n: NotificationModel) => void;
};

const NotificationItem = ({ notification, onOpen }: Props) => {
  const { icon, tone } = notificationVisual(notification.sourceType);
  const unread = !notification.read;

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors
        hover:bg-(--bg-color-extrathin)
        ${unread ? "bg-(--bg-color-extrathin)/60" : ""}`}
    >
      <span
        className={`flex aspect-square w-9 shrink-0 items-center justify-center rounded-full bg-(--bg-color-extrathin) ${tone}`}
      >
        <i className={`fa-solid ${icon} text-sm`} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <p
          className={`truncate text-sm ${
            unread
              ? "text-(--text-main-color) font-medium"
              : "text-(--text-main-color-light)"
          }`}
        >
          {notification.content}
        </p>
        <span className="text-(--text-main-color-blur) text-xs">
          {dayjs(notification.createdTime).fromNow()}
        </span>
      </div>

      {unread && (
        <span className="bg-light-blue-500 aspect-square w-2 shrink-0 rounded-full" />
      )}
    </button>
  );
};

export default NotificationItem;
