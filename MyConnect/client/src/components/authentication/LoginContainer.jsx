import React, { useEffect, useState } from "react";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";

const LoginContainer = (props) => {
  const { show } = props;
  const [showLogin, setShowLogin] = useState(true);
  const [showForgot, setShowFotgot] = useState(false);

  useEffect(() => {
    // Khi toggle ẩn login container thì trả lại vị trí ban đầu của login và forgotpass
    // để khi toggle hiện lại sẽ đúng vị trí
    if (!show) {
      setTimeout(() => {
        setShowLogin(true);
        setShowFotgot(false);
      }, 500);
    }
  }, [show]);

  return (
    <div
      data-state={show}
      className="absolute right-0 flex h-full w-[40%] flex-col justify-center overflow-hidden bg-[var(--bg-color)] transition-all duration-500
      data-[state=false]:translate-x-[700%] data-[state=true]:translate-x-0"
    >
      <div className="relative">
        <Login
          show={showLogin}
          showContainer={show}
          toggle={() => {
            setShowLogin(false);
            setShowFotgot(true);
          }}
        />
        <ForgotPassword
          show={showForgot}
          showContainer={show}
          toggle={() => {
            setShowLogin(true);
            setShowFotgot(false);
          }}
        />
      </div>
    </div>
  );
};

export default LoginContainer;
