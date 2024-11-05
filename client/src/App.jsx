import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Authentication from "./components/authentication/Authentication";
import { Home } from "./components/chat/Home";
import { registerSW } from "./components/common/Notification";
import { LoadingProvider } from "./context/LoadingContext";
import { useInfo } from "./hook/CustomHooks";

function App() {
  if (typeof setImmediate === "undefined") {
    window.setImmediate = (fn) => setTimeout(fn, 0);
    window.clearImmediate = window.clearTimeout;
  }
  useEffect(() => {
    registerSW();
  }, []);

  const { data: info, isLoading } = useInfo();
  const authenticated = info;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            isLoading ? null : authenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Authentication />
            )
          }
        ></Route>
        <Route
          path="/"
          element={
            <LoadingProvider>
              <Home />
            </LoadingProvider>

            // <ToastContainer
            //   position="bottom-right"
            //   autoClose={1000}
            //   hideProgressBar={false}
            //   newestOnTop={false}
            //   closeOnClick
            //   rtl={false}
            //   pauseOnFocusLoss
            //   draggable
            //   pauseOnHover
            //   theme="colored"
            //   transition:Bounce
            // />
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
