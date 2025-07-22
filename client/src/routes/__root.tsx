import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import "../App.css";
import LoadingProvider from "../context/LoadingContext";
import { SignalProvider } from "../context/SignalContext";
import useInfo from "../features/authentication/hooks/useInfo";
import userQueryOptions from "../features/authentication/queries/userInfoQuery";
import SideBar from "../layouts/SideBar";
import { MyRouterContext } from "../main";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
  // Loader chỉ chạy nếu không ở /auth/*
  loader: async ({ location, context: { queryClient } }) => {
    const isAuthPage = location.pathname.startsWith("/auth");

    // Nếu là trang auth thì không làm gì cả
    if (isAuthPage) return null;

    // Nếu KHÔNG ở trang /auth → bắt buộc phải có userInfo
    try {
      console.log("Fetching user info");

      await queryClient.ensureQueryData(userQueryOptions);
    } catch (err) {
      // Gọi API thất bại → redirect về /auth
      return redirect({ to: "/auth" });
    }
  },
});

function RootComponent() {
  // const location = useLocation();
  // const isAuthPage = location.pathname.startsWith("/auth");

  const { data: info } = useInfo();

  return (
    <div className="relative flex w-full text-[var(--text-main-color-light)] phone:text-base tablet:text-base desktop:text-md">
      <LoadingProvider>
        {/* Chỉ cung cấp SignalContext nếu user đã login */}
        {info ? (
          <SignalProvider>
            <SideBar />
            <div className="relative grow">
              <Outlet />
            </div>
          </SignalProvider>
        ) : (
          // Nếu chưa login vẫn cần render để hiện /auth/*
          <Outlet />
        )}
      </LoadingProvider>
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </div>
  );
}
