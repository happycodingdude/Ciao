import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import getFirebaseApp from "./utils/firebaseConfig";
import queryClient from "./utils/queryClient";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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
