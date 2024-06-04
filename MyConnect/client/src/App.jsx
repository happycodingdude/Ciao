import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import { RequireAuth } from "./common/Utility";
import Authentication from "./components/authentication/Authentication";
import { HomeContainer } from "./components/chat/Home";
import { registerSW } from "./components/common/Notification";

function App() {
  if (typeof setImmediate === "undefined") {
    window.setImmediate = (fn) => setTimeout(fn, 0);
    window.clearImmediate = window.clearTimeout;
  }
  useEffect(() => {
    registerSW();
  }, []);

  // Create a client
  const queryClient = new QueryClient();

  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/authen" element={<Authentication />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomeContainer />} />
        </Route>
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition:Bounce
      />
    </QueryClientProvider>
  );
}

export default App;
