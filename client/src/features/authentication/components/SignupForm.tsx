import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ErrorComponent from "../../../components/ErrorComponent";
import { SignupRequest } from "../../../types";
import useAuthenticationFormToggles from "../hooks/useToggleAuthenticationForms";
import signup from "../services/signup";

const SignupForm = () => {
  const { toggle, setToggle } = useAuthenticationFormToggles();

  const [processing, setProcessing] = useState(false);

  const refName = useRef<HTMLInputElement & { reset: () => void }>();
  const refUsername = useRef<HTMLInputElement & { reset: () => void }>();
  const refPassword = useRef<HTMLInputElement & { reset: () => void }>();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setError("");
    refName.current.reset();
    refUsername.current.reset();
    refPassword.current.reset();
  };

  // useEffect(() => {
  //   // Khi toggle ẩn signup thì clear các value đã nhập
  //   if (!show) reset();
  // }, [show]);

  const { mutate: signupMutation } = useMutation({
    mutationFn: (req: SignupRequest) => signup(req),
    onSuccess: (res) => {
      setProcessing(false);
      setToggle("signin");
    },
    onError: (error: AxiosError) => {
      setProcessing(false);
      setError(error.response.data as string);
    },
  });

  const signupCTA = () => {
    if (refUsername.current.value === "" || refPassword.current.value === "")
      return;

    setProcessing(true);
    signupMutation({
      name: refName.current.value,
      username: refUsername.current.value,
      password: refPassword.current.value,
    });
  };

  return (
    <div className="flex flex-col gap-[3rem]">
      {/* <div className="flex flex-col gap-[3rem]"> */}
      <CustomInput
        tabIndex={toggle === "signup" ? 1 : -1}
        inputRef={refName}
        type="text"
        label="Name"
      />
      <CustomInput
        tabIndex={toggle === "signup" ? 2 : -1}
        inputRef={refUsername}
        type="text"
        label="Username"
      />
      <div className="relative">
        <CustomInput
          tabIndex={toggle === "signup" ? 3 : -1}
          inputRef={refPassword}
          className="pr-20"
          type={showPassword ? "text" : "password"}
          label="Password"
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
        title="Sign up"
        onClick={signupCTA}
      />
    </div>
  );
};

export default SignupForm;
