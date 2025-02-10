import React from "react";
import SigninForm from "../features/authentication/components/SigninForm";
import useAuthenticationFormToggles from "../features/authentication/hooks/useAuthenticationFormToggles";

const Signin = () => {
  const { toggle } = useAuthenticationFormToggles();
  return (
    <div
      data-state={toggle === "signin" || toggle === "signup"}
      className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] duration-500 
      data-[state=false]:translate-y-[-100%] data-[state=true]:translate-y-0"
    >
      <p className="text-5xl text-[var(--text-main-color)]">Sign in</p>

      <SigninForm />
    </div>
  );
};

export default Signin;
