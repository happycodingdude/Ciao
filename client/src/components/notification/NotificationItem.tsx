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
  const timeLabel = t.isSame(dayjs(), "day")
    ? t.format("h:mm A")
    : t.format("M/D");

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`hover:bg-(--bg-color-extrathin) relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left
        transition-colors
        ${isSelected ? "bg-(--bg-color-extrathin)" : unread ? "bg-(--bg-color-extrathin)/50" : ""}
        ${isSelected ? "before:absolute before:left-0 before:top-1/2 before:h-7 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-light-blue-500 before:content-['']" : ""}`}
    >
      {/* Avatar người gây hành động + badge loại hoạt động (kiểu Teams). */}
      <span className="relative shrink-0">
        {notification.actorAvatar ? (
          <span
            style={{ backgroundImage: `url(${notification.actorAvatar})` }}
            className="bg-(--bg-color-extrathin) block aspect-square w-10 rounded-full bg-cover bg-center"
          />
        ) : (
          <span className="text-2xs flex aspect-square w-10 items-center justify-center rounded-full bg-light-blue-500 font-semibold text-white">
            {initial}
          </span>
        )}
        <span
          className={`w-4.5 border-(--bg-color) bg-(--bg-color-light) absolute -bottom-0.5 -right-0.5 flex aspect-square
            items-center justify-center rounded-full border-2 ${tone}`}
        >
          <i className={`fa-solid ${icon} text-[8px]`} />
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        {/* Dòng 1: tên (đậm) + thời gian. */}
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-(--text-main-color) truncate text-xs font-semibold">
            {actorName}
          </span>
          <span className="text-(--text-main-color-blur) text-3xs shrink-0">
            {timeLabel}
          </span>
        </span>

        {/* Dòng 2: action. */}
        {action && (
          <span className="text-(--text-main-color-light) text-2xs mt-0.5 truncate">
            {action}
          </span>
        )}

        {/* Dòng 3: preview — snippet tin nhắn / tên group. */}
        {preview && (
          <span className="text-(--text-main-color-blur) text-3xs mt-0.5 truncate">
            {preview}
          </span>
        )}
      </span>

      {/* Slot cố định cho dot unread: luôn chiếm cùng width (kể cả khi read) để
          cột content không co lại → thời gian thẳng hàng giữa item read/unread. */}
      <span className="flex w-2 shrink-0 justify-center self-start">
        {unread && (
          <span className="aspect-square w-2 rounded-full bg-light-blue-500" />
        )}
      </span>
    </button>
  );
};

export default NotificationItem;
