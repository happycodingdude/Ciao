import React from "react";
import ForgotPasswordForm from "../features/authentication/components/ForgotPasswordForm";

const ForgotPassword = (props) => {
  console.log("ForgotPassword calling");
  const { show, toggle } = props;

  return (
    <div
      data-state={show}
      className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] bg-[var(--bg-color-bold)] duration-500 
        data-[state=false]:translate-y-0 data-[state=true]:translate-y-[-100%]"
    >
      <p className="text-5xl text-[var(--text-main-color)]">Reset</p>

      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPassword;
