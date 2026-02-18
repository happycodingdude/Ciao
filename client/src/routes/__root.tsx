// import { QueryClient, useQueryClient } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import {
//   createRootRouteWithContext,
//   Link,
//   Outlet,
//   redirect,
//   useLocation,
// } from "@tanstack/react-router";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import SideBar from "../components/layouts/SideBar";
// import LoadingProvider from "../context/LoadingContext";
// import { SignalProvider } from "../context/SignalContext";
// import { userQueryOptions } from "../hooks/useInfo";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../styles/App.css";

// type RouterContext = {
//   queryClient: QueryClient;
// };

// export const Route = createRootRouteWithContext<RouterContext>()({
//   loader: async ({ location, context: { queryClient } }) => {
//     const isAuthPage = location.pathname.startsWith("/auth");

//     // Nếu là trang auth thì không làm gì cả
//     if (isAuthPage) return null;

//     // Nếu KHÔNG ở trang /auth → bắt buộc phải có userInfo
//     try {
//       console.log("Fetching user info");

//       await queryClient.ensureQueryData(userQueryOptions);
//     } catch (err) {
//       // Gọi API thất bại → redirect về /auth
//       return redirect({ to: "/auth" });
//     }
//   },
//   component: RootComponent,
//   notFoundComponent: () => {
//     return (
//       <div>
//         <p>This is the notFoundComponent configured on root route</p>
//         <Link to="/">Start Over</Link>
//       </div>
//     );
//   },
// });

// function RootComponent() {
//   console.log("Rendering RootComponent");
//   // const { data: info, isLoading } = useInfo();
//   const queryClient = useQueryClient();
//   const location = useLocation();

//   const info = queryClient.getQueryData(userQueryOptions.queryKey);

//   const isAuthPage = location.pathname.startsWith("/auth");
//   // Auth pages → không layout
//   if (isAuthPage) {
//     return <Outlet />;
//   }

//   // App pages → chưa login thì không render
//   if (!info) {
//     return null; // hoặc spinner
//   }

//   return (
//     <>
//       <div className="text-(--text-main-color) desktop:text-md laptop:text-2xs laptop-lg:text-xs relative flex w-full">
//         <SideBar />
//         <div className="relative grow">
//           <LoadingProvider>
//             <SignalProvider>
//               <Outlet />
//             </SignalProvider>
//           </LoadingProvider>
//         </div>
//       </div>
//       <ReactQueryDevtools buttonPosition="bottom-right" />
//       <ToastContainer
//         position="bottom-right"
//         autoClose={1000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//     </>
//   );
// }

import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

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
      <TanStackRouterDevtools />
    </>
  );
}
