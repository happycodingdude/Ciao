import React from "react";
import SigninForm from "../features/authentication/components/SigninForm";

const Login = (props) => {
  console.log("Login calling");
  const { show, showContainer, toggle, onSuccess } = props;

  return (
    <div
      data-state={show}
      className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] duration-500 
      data-[state=false]:translate-y-[-100%] data-[state=true]:translate-y-0"
    >
      <p className="text-5xl text-[var(--text-main-color)]">Sign in</p>

      <SigninForm />
    </div>
  );
};

export default Login;
