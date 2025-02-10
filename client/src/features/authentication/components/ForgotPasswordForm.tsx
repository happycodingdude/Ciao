import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ErrorComponent from "../../../components/ErrorComponent";
import { SigninRequest } from "../../../types";
import useAuthenticationFormToggles from "../hooks/useAuthenticationFormToggles";
import forgotPassword from "../services/forgotPassword";

const ForgotPasswordForm = () => {
  const { toggle, setToggle } = useAuthenticationFormToggles();

  const refUsername = useRef<HTMLInputElement & { reset: () => void }>();
  const refPassword = useRef<HTMLInputElement & { reset: () => void }>();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);

  const reset = () => {
    setError("");
    setProcessing(false);
    refUsername.current.reset();
    refPassword.current.reset();
  };

  useEffect(() => {
    if (toggle !== "signin") reset();
  }, [toggle]);

  const { mutate: forgotPasswordMutation } = useMutation({
    mutationFn: (req: SigninRequest) => forgotPassword(req),
    onSuccess: (res) => {
      reset();
      setToggle("signin");
    },
    onError: (error: AxiosError) => {
      setProcessing(false);
      setError(error.response.data as string);
    },
  });

  const forgotPasswordCTA = () => {
    if (refUsername.current.value === "" || refPassword.current.value === "")
      return;

    setProcessing(true);
    forgotPasswordMutation({
      username: refUsername.current.value,
      password: refPassword.current.value,
    });
  };

  return (
    <div className="flex flex-col gap-[3rem]">
      <CustomInput
        tabIndex={toggle === "forgot" ? 1 : -1}
        inputRef={refUsername}
        type="text"
        label="Username"
      />

      <div className="relative">
        <CustomInput
          tabIndex={toggle === "forgot" ? 2 : -1}
          inputRef={refPassword}
          className="pr-20"
          type={showPassword ? "text" : "password"}
          label="New password"
        />
        <div
          onClick={() => setShowPassword(!showPassword)}
          className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center 
              hover:text-[var(--main-color-light)] ${showPassword ? "fa-eye text-[var(--main-color)]" : "fa-eye-slash text-[var(--main-color)]"}`}
        ></div>
      </div>

      <ErrorComponent error={error} />

      <CustomButton
        processing={processing}
        title="Reset"
        onClick={forgotPasswordCTA}
      />

      <div
        className="cursor-pointer text-[var(--text-main-color-light)] hover:text-[var(--text-main-color)]"
        onClick={() => setToggle("signin")}
      >
        Back to login
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
