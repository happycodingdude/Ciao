import { initializeApp } from "firebase/app";
import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoadingProvider from "./context/LoadingContext";
import { SignalProvider } from "./context/SignalContext";
import "./Loading.css";
import { AuthenticationContainer } from "./pages/Authentication";
import Home from "./pages/Home";
import ProtectedRoute from "./pages/ProtectedRoute";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7JnGdGGjcoFN3gR8XPVu4nYpVSORuVnA",
  authDomain: "myconnect-f2af8.firebaseapp.com",
  projectId: "myconnect-f2af8",
  storageBucket: "myconnect-f2af8.appspot.com",
  messagingSenderId: "191922075446",
  appId: "1:191922075446:web:72ab430046b40d39e22597",
  measurementId: "G-8Q1N0TGXLZ",
};

// Initialize Firebase
initializeApp(firebaseConfig);

function App() {
  // if (typeof setImmediate === "undefined") {
  //   window.setImmediate = (fn) => setTimeout(fn, 0);
  //   window.clearImmediate = window.clearTimeout;
  // }
  if (typeof window.setImmediate === "undefined") {
    (window as any).setImmediate = (fn: () => void, ...args: any[]) =>
      setTimeout(fn, 0, ...args);

    (window as any).clearImmediate = window.clearTimeout;
  }

  useEffect(() => {
    // registerSW();
  }, []);

  return (
    <LoadingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthenticationContainer />}></Route>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <SignalProvider>
                  <Home />
                </SignalProvider>
              }
            ></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
