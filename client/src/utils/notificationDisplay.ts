import dayjs from "dayjs";
import { NotificationModel } from "../types/base.types";
import { NotificationTab } from "../types/notification.types";

// Icon + tone theo sourceType. Hiện BE chỉ phát "friend_request"; các nhánh còn lại để
// forward-compatible khi BE bổ sung notification message/reaction.
export type NotificationVisual = { icon: string; tone: string };

export const notificationVisual = (sourceType: string): NotificationVisual => {
  switch (sourceType) {
    case "friend_request":
      return { icon: "fa-user-plus", tone: "text-light-blue-500" };
    case "message":
      return { icon: "fa-comment-dots", tone: "text-(--main-color)" };
    case "reaction":
      return { icon: "fa-heart", tone: "text-red-500" };
    case "mention":
      return { icon: "fa-at", tone: "text-light-blue-500" };
    default:
      return { icon: "fa-bell", tone: "text-(--text-main-color-blur)" };
  }
};

// Lọc client-side theo tab (server trả full list, phân trang theo thời gian).
export const matchesTab = (n: NotificationModel, tab: NotificationTab): boolean => {
  switch (tab) {
    case "unread":
      return !n.read;
    case "requests":
      return n.sourceType === "friend_request";
    case "system":
      return n.sourceType !== "friend_request";
    case "all":
    default:
      return true;
  }
};

export type NotificationGroup = {
  key: string;
  label: string;
  items: NotificationModel[];
};

// Gom nhóm theo ngày: Today / Yesterday / Earlier. Bỏ nhóm rỗng.
export const groupByDay = (items: NotificationModel[]): NotificationGroup[] => {
  const today = dayjs().startOf("day");
  const yesterday = today.subtract(1, "day");

  const today_: NotificationModel[] = [];
  const yesterday_: NotificationModel[] = [];
  const earlier_: NotificationModel[] = [];

  for (const n of items) {
    const d = dayjs(n.createdTime).startOf("day");
    if (d.isSame(today)) today_.push(n);
    else if (d.isSame(yesterday)) yesterday_.push(n);
    else earlier_.push(n);
  }

  return [
    { key: "today", label: "Today", items: today_ },
    { key: "yesterday", label: "Yesterday", items: yesterday_ },
    { key: "earlier", label: "Earlier", items: earlier_ },
  ].filter((g) => g.items.length > 0);
};
