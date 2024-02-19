import { Route, Routes } from "react-router-dom";
import "./App.css";
import { RequireAuth } from "./common/Utility";
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
