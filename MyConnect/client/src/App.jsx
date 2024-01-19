import { Route, Routes } from "react-router-dom";
import RequireAuth from "../src/context/RequireAuth";
import "./App.css";
import Home from "./Home";
import Login from "./Login";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
