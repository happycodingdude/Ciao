import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./Loading.css";
import Authentication from "./components/authentication/Authentication";
import { Home } from "./components/chat/Home";
import { registerSW } from "./components/common/Notification";
import { LoadingProvider } from "./context/LoadingContext";
import AuthRoute from "./route/AuthRoute";
import ProtectedRoute from "./route/ProtectedRoute";

function App() {
  if (typeof setImmediate === "undefined") {
    window.setImmediate = (fn) => setTimeout(fn, 0);
    window.clearImmediate = window.clearTimeout;
  }
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <LoadingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthRoute />}>
            <Route path="/auth" element={<Authentication />}></Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <Home />

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
          </Route>
        </Routes>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
