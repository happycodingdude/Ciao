import React from "react";
import useAuthenticationFormToggles from "../features/authentication/hooks/useAuthenticationFormToggles";
import ForgotPassword from "../pages/ForgotPassword";
import Signin from "../pages/Signin";

const SigninContainer = () => {
  const { toggle } = useAuthenticationFormToggles();

  return (
    <div
      data-state={toggle === "signin" || toggle === "forgot"}
      className="absolute right-0 flex h-full w-[40%] flex-col justify-center overflow-hidden transition-all duration-500
      data-[state=false]:translate-x-[700%] data-[state=true]:translate-x-0"
    >
      <div className="relative">
        <Signin />
        <ForgotPassword />
      </div>
    </div>
  );
};

export default SigninContainer;
