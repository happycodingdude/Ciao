import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "./App.css";
import { Home } from "./components/chat/Home";
import { registerSW } from "./components/common/Notification";
import { LoadingProvider } from "./context/LoadingContext";

function App() {
  if (typeof setImmediate === "undefined") {
    window.setImmediate = (fn) => setTimeout(fn, 0);
    window.clearImmediate = window.clearTimeout;
  }
  useEffect(() => {
    registerSW();
  }, []);

  // const { isLoading } = useInfo();
  // // const { setLoading } = useLoading();

  // const [showAuthen, setShowAuthen] = useState(false);

  // if (isLoading) {
  //   // setLoading(true);
  //   return;
  // }

  // useEffect(() => {
  //   // When clear cache
  //   if (!localStorage.getItem("token") && !localStorage.getItem("refresh")) {
  //     // setLoading(false);
  //     // return <Authentication />;
  //     setShowAuthen(true);
  //   }
  // }, []);

  return (
    <>
      <LoadingProvider>
        {/* {showAuthen ? <Authentication /> : <Home />} */}
        <Home />
      </LoadingProvider>

      <ToastContainer
        position="bottom-right"
        autoClose={1000}
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
    </>
  );
}

export default App;
