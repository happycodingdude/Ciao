import { createFileRoute } from "@tanstack/react-router";
import Notification from "../pages/Notification";
import { NOTIFICATION_TABS, NotificationTab } from "../types/notification.types";

export const Route = createFileRoute("/_layout/notifications")({
  // Tab giữ trên URL (?tab=) để deep-link và survive refresh/share.
  validateSearch: (search: Record<string, unknown>): { tab: NotificationTab } => {
    const tab = search.tab as NotificationTab;
    return { tab: NOTIFICATION_TABS.includes(tab) ? tab : "all" };
  },
  component: Notification,
});
