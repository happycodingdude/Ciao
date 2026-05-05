import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import "../styles/App.css";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      {/* DevTools sẽ chỉ hiển thị trong môi trường development */}
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
