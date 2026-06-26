import dayjs from "dayjs";
import { NotificationModel } from "../../types/base.types";
import {
  notificationParts,
  notificationVisual,
} from "../../utils/notificationDisplay";

type Props = {
  notification: NotificationModel;
  onOpen: (n: NotificationModel) => void;
  isSelected?: boolean;
};

const NotificationItem = ({ notification, onOpen, isSelected }: Props) => {
  const { icon, tone } = notificationVisual(notification);
  const { actorName, action, preview } = notificationParts(notification);
  const unread = !notification.read;

  const initial = (actorName.trim()[0] ?? "?").toUpperCase();

  // Teams: cùng ngày → giờ; khác ngày → M/D.
  const t = dayjs(notification.createdTime);
  const timeLabel = t.isSame(dayjs(), "day") ? t.format("h:mm A") : t.format("M/D");

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors
        hover:bg-(--bg-color-extrathin)
        ${isSelected ? "bg-(--bg-color-extrathin)" : unread ? "bg-(--bg-color-extrathin)/50" : ""}
        ${isSelected ? "before:bg-light-blue-500 before:absolute before:left-0 before:top-1/2 before:h-7 before:w-1 before:-translate-y-1/2 before:rounded-full before:content-['']" : ""}`}
    >
      {/* Avatar người gây hành động + badge loại hoạt động (kiểu Teams). */}
      <span className="relative shrink-0">
        {notification.actorAvatar ? (
          <span
            style={{ backgroundImage: `url(${notification.actorAvatar})` }}
            className="block aspect-square w-11 rounded-full bg-(--bg-color-extrathin) bg-cover bg-center"
          />
        ) : (
          <span className="bg-light-blue-500 flex aspect-square w-11 items-center justify-center rounded-full text-base font-semibold text-white">
            {initial}
          </span>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex aspect-square w-5 items-center justify-center
            rounded-full border-2 border-(--bg-color) bg-(--bg-color-light) ${tone}`}
        >
          <i className={`fa-solid ${icon} text-[9px]`} />
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        {/* Dòng 1: tên (đậm) + thời gian. */}
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-(--text-main-color) truncate text-sm font-semibold">
            {actorName}
          </span>
          <span className="text-(--text-main-color-blur) shrink-0 text-xs">
            {timeLabel}
          </span>
        </span>

        {/* Dòng 2: action. */}
        {action && (
          <span className="text-(--text-main-color-light) mt-0.5 truncate text-sm">
            {action}
          </span>
        )}

        {/* Dòng 3: preview — snippet tin nhắn / tên group. */}
        {preview && (
          <span className="text-(--text-main-color-blur) mt-0.5 truncate text-xs">
            {preview}
          </span>
        )}
      </span>

      {unread && (
        <span className="bg-light-blue-500 aspect-square w-2 shrink-0 rounded-full" />
      )}
    </button>
  );
};

export default NotificationItem;
