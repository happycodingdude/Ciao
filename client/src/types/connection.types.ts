export type ConnectionTab = "all" | "online" | "requests" | "add";

// Thứ tự hiển thị tab + dùng để validate search param trên route.
export const CONNECTION_TABS: ConnectionTab[] = [
  "all",
  "online",
  "requests",
  "add",
];
