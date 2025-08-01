import { createRouter, RouterProvider } from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import ReactDOM from "react-dom/client";
import "./index.css";
// Import the generated route tree
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeApp } from "firebase/app";
import { StrictMode } from "react";
import { ConversationModel } from "./features/listchat/types";
import { routeTree } from "./routeTree.gen";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7JnGdGGjcoFN3gR8XPVu4nYpVSORuVnA",
  authDomain: "myconnect-f2af8.firebaseapp.com",
  projectId: "myconnect-f2af8",
  storageBucket: "myconnect-f2af8.appspot.com",
  messagingSenderId: "191922075446",
  appId: "1:191922075446:web:72ab430046b40d39e22597",
  measurementId: "G-8Q1N0TGXLZ",
};

// Initialize Firebase
initializeApp(firebaseConfig);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // refetchOnWindowFocus: false,
      retry: false,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export type MyRouterContext = {
  queryClient: QueryClient;
  conversations?: ConversationModel[];
};

// Set up a Router instance
// @ts-ignore
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  } as MyRouterContext,
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
