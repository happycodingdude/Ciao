import { Route, Routes } from "react-router-dom";
import RequireAuth from "../src/context/RequireAuth";
import "./App.css";
import Authentication from "./components/authentication/Authentication";
import Home from "./components/chat/Home";

function App() {
  return (
    <Routes>
      <Route path="/authen" element={<Authentication />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
