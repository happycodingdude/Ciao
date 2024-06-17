import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useLoading } from "../../hook/CustomHooks";
import { forgotPassword } from "../../hook/UserAPIs";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ErrorComponent from "../common/ErrorComponent";

const ForgotPassword = (props) => {
  console.log("ForgotPassword calling");
  const { show, showContainer, toggle } = props;

  const { setLoading } = useLoading();

  const refForgotPassword = useRef();
  const refUsername = useRef();
  const refPassword = useRef();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Khi toggle hiện login container ra thì clear các value đã nhập
    if (showContainer) reset();
  }, [showContainer]);

  const reset = () => {
    setError("");
    refUsername.current.reset();
    refPassword.current.reset();
  };

  const { mutate: forgotPasswordMutation } = useMutation({
    mutationFn: ({ username, password }) => forgotPassword(username, password),
    onSuccess: (res) => {
      reset();
      toggle();
    },
    onError: (error) => {
      setLoading(false);
      setError("Username or password invalid. Try again please");
    },
  });

  const forgotPasswordCTA = () => {
    if (refUsername.current.value === "" || refPassword.current.value === "")
      return;

    setLoading(true);
    forgotPasswordMutation({
      username: refUsername.current.value,
      password: refPassword.current.value,
    });
  };

  return (
    <div
      ref={refForgotPassword}
      data-state={show}
      className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] bg-[var(--bg-color)] duration-500 
        data-[state=false]:translate-y-0 data-[state=true]:translate-y-[-100%]"
    >
      <p className="text-5xl">Reset</p>

      <div className="flex flex-col gap-[3rem]">
        <CustomInput reference={refUsername} type="text" label="Username" />

        <div className="relative">
          <CustomInput
            reference={refPassword}
            className="pr-20"
            type={showPassword ? "text" : "password"}
            label="New password"
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center 
              hover:text-[var(--main-color-bold)] ${showPassword ? "fa-eye text-[var(--main-color)]" : "fa-eye-slash text-[var(--main-color)]"}`}
          ></div>
        </div>

        <ErrorComponent error={error} />

        <CustomButton title="Reset" onClick={forgotPasswordCTA} />

        <div
          className="cursor-pointer text-[var(--text-main-color-blur)] hover:text-[var(--text-main-color)]"
          onClick={() => {
            reset();
            toggle();
          }}
        >
          Back to login
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
