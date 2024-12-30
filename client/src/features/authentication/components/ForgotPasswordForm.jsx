import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ErrorComponent from "../../../components/ErrorComponent";
import forgotPassword from "../services/forgotPassword";

const ForgotPasswordForm = (props) => {
  console.log("ForgotPassword calling");
  const { show, toggle } = props;

  const refUsername = useRef();
  const refPassword = useRef();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Khi toggle hiện login container ra thì clear các value đã nhập
    if (!show) reset();
  }, [show]);

  const reset = () => {
    setError("");
    setProcessing(false);
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
      setProcessing(false);
      setError(error.response.data);
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
        tabIndex={show ? "1" : "-1"}
        reference={refUsername}
        type="text"
        label="Username"
      />

      <div className="relative">
        <CustomInput
          tabIndex={show ? "2" : "-1"}
          reference={refPassword}
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
        onClick={() => {
          toggle();
        }}
      >
        Back to login
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
