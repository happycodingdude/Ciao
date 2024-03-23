import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
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
  return (
    <Routes>
      <Route path="/authen" element={<Authentication />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomeContainer />} />
      </Route>
    </Routes>
  );
}

export default App;
