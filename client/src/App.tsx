import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { registerSW } from "./components/Notification";
import LoadingProvider from "./context/LoadingContext";
import "./Loading.css";
import { AuthenticationContainer } from "./pages/Authentication";
import Home from "./pages/Home";
import ProtectedRoute from "./pages/ProtectedRoute";

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
          <Route path="/auth" element={<AuthenticationContainer />}></Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
