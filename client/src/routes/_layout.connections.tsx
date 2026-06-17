import { createFileRoute } from "@tanstack/react-router";
import Connection from "../pages/Connection";
import { CONNECTION_TABS, ConnectionTab } from "../types/connection.types";

export const Route = createFileRoute("/_layout/connections")({
  // Tab được giữ trên URL (?tab=) để deep-link từ Dashboard và survive refresh/share.
  validateSearch: (search: Record<string, unknown>): { tab: ConnectionTab } => {
    const tab = search.tab as ConnectionTab;
    return { tab: CONNECTION_TABS.includes(tab) ? tab : "all" };
  },
  component: Connection,
});
