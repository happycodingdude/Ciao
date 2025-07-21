import { createRouter, RouterProvider } from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// Import the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

// Set up a Router instance
// @ts-ignore
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "none", // ✅ Không preload loader/component khi hover link
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  // defaultPreloadStaleTime: 0,
  // scrollRestoration: true,
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
