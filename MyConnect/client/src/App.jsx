import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "./App.css";
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
    <>
      <HomeContainer />

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition:Bounce
      />

      {/* <LoadingProvider>
        <Loading />
      </LoadingProvider> */}
    </>
  );
}

export default App;
