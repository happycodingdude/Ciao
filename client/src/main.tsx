import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import getFirebaseApp from "./utils/firebaseConfig";
import queryClient from "./utils/queryClient";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import "./index.css";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    ss: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1Y",
    yy: "%dY",
  },
});

// ✅ Initialize Firebase (singleton pattern)
getFirebaseApp();

// export type MyRouterContext = {
//   queryClient: QueryClient;
//   conversations?: ConversationModel[];
// };

// Set up a Router instance
// @ts-ignore
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: false, // ✅ Không preload loader/component khi hover link
});

// Xuất kiểu để tái sử dụng
export type AppRouter = typeof router;

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
