import React from "react";
import SignupForm from "../features/authentication/components/SignupForm";
import useToggleAuthenticationForms from "../features/authentication/hooks/useAuthenticationFormToggles";
import { isPhoneScreen } from "../utils/getScreenSize";

const Signup = () => {
  // const { show, onSuccess } = props;
  // console.log("Signup calling");

  const { toggle } = useToggleAuthenticationForms();

  return (
    <div
      data-state={toggle === "signup"}
      className={`absolute left-0 h-full transition-all duration-500
      data-[state=false]:translate-x-[-700%] data-[state=true]:translate-x-0
      ${isPhoneScreen() ? "w-full" : "w-[40%]"}`}
    >
      <div className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem]">
        <p className="text-5xl text-[var(--text-main-color)]">Create account</p>

        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
