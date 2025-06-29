// import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { persistQueryClient } from "@tanstack/react-query-persist-client";
import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

// // Tạo persister để lưu cache vào localStorage
// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// });

// // Kích hoạt cache persist
// persistQueryClient({
//   queryClient,
//   persister,
//   maxAge: 1000 * 60 * 60 * 24, // 24 hours
//   dehydrateOptions: {
//     shouldDehydrateQuery: (query) => {
//       // 👇 Chỉ persist những query có key sau
//       const [key] = query.queryKey;
//       return ["message"].includes(key as string);
//     },
//   },
// });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
