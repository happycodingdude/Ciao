import { Route, Routes } from "react-router-dom";
import RequireAuth from "../src/context/RequireAuth";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import Header from "./components/Header";

function App() {
  return (
    <div
      className="flex w-full flex-col bg-gradient-to-r from-purple-100
    to-blue-100 text-[clamp(1.6rem,1.3vw,2rem)] [&>*]:px-[2rem]"
    >
      <Header />
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
