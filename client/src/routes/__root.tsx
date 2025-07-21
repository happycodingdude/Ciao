import { QueryClient, queryOptions } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Link,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../App.css";
import LoadingProvider from "../context/LoadingContext";
import { SignalProvider } from "../context/SignalContext";
import useInfo from "../features/authentication/hooks/useInfo";
import getInfo from "../features/authentication/services/getInfo";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";

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
  // Loader chỉ chạy nếu không ở /auth/*
  loader: async ({ location, context: { queryClient } }) => {
    const isAuthPage = location.pathname.startsWith("/auth");
    const token = localStorage.getItem("accessToken");

    // if (!token) {
    //   return redirect({ to: "/auth" });
    // }

    // Nếu KHÔNG ở trang /auth → bắt buộc phải có userInfo
    if (!isAuthPage) {
      try {
        await queryClient.ensureQueryData(userQueryOptions);
      } catch (err) {
        // Gọi API thất bại → redirect về /auth
        return redirect({ to: "/auth" });
      }
    }

    // Ngược lại nếu là trang /auth thì không cần gì cả
    return null;
  },
});

function RootComponent() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/auth");

  const { data: info } = useInfo();
  // if (!info) return null;

  return (
    <LoadingProvider>
      <div className="relative flex w-full text-[var(--text-main-color-light)] phone:text-base tablet:text-base desktop:text-md">
        {isAuthPage ? (
          <AuthLayout />
        ) : info ? (
          <SignalProvider>
            <MainLayout />
          </SignalProvider>
        ) : (
          ""
        )}
      </div>
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools />
    </LoadingProvider>
  );
}
