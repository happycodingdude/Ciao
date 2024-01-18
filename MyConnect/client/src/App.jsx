import { Route, Routes } from "react-router-dom";
import RequireAuth from "../src/context/RequireAuth";
import "./App.css";
import Home from "./Home";
import Login from "./Login";

function App() {
  return (
    // <div className="flex w-full flex-col bg-gradient-to-r from-purple-100 to-blue-100 text-[clamp(1rem,1.2vw,2rem)]">
    <div className="flex w-full flex-col bg-white text-[clamp(1rem,1.2vw,2rem)]">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
