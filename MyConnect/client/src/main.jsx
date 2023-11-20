import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  //   <BrowserRouter>
  //     <AuthProvider>
  //       <Routes>
  //         <Route path="/*" element={<App />} />
  //       </Routes>
  //     </AuthProvider>
  //   </BrowserRouter>
  // </React.StrictMode>

  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
