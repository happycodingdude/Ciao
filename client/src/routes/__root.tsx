import { QueryClient, queryOptions } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../App.css";
import LoadingProvider from "../context/LoadingContext";
import { SignalProvider } from "../context/SignalContext";
import getInfo from "../features/authentication/services/getInfo";
import SideBar from "../layouts/SideBar";

const userQueryOptions = queryOptions({
  queryKey: ["info"],
  queryFn: getInfo,
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(userQueryOptions),
});

function RootComponent() {
  return (
    // <LoadingProvider>
    //   <SignalProvider>
    //     {/* <div className="flex gap-2 p-2">
    //     <Link to="/" className="[&.active]:font-bold">
    //       Home
    //     </Link>
    //     <Link to="/about" className="[&.active]:font-bold">
    //       About
    //     </Link>
    //     <Link to="/chats" className="[&.active]:font-bold">
    //       Chats
    //     </Link>
    //   </div>
    //   <hr /> */}
    //     <div className="relative flex w-full text-[var(--text-main-color-light)] phone:text-base tablet:text-base desktop:text-md">
    //       <SideBar />
    //       <Outlet />
    //     </div>
    //     <ReactQueryDevtools buttonPosition="bottom-right" />
    //     <TanStackRouterDevtools />
    //   </SignalProvider>
    // </LoadingProvider>
    <LoadingProvider>
      <SignalProvider>
        <div className="relative flex w-full text-[var(--text-main-color-light)] phone:text-base tablet:text-base desktop:text-md">
          <SideBar />
          <Outlet />
        </div>
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <TanStackRouterDevtools />
      </SignalProvider>
    </LoadingProvider>
  );
}
