import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ErrorComponent from "../../../components/ErrorComponent";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { SigninRequest } from "../../../types";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import useAuthenticationFormToggles from "../hooks/useAuthenticationFormToggles";
import signin from "../services/signin";

const SigninForm = () => {
  // const { show, showContainer, toggle } = props;

  const navigate = useNavigate();

  const { toggle, setToggle } = useAuthenticationFormToggles();

  // const [accessToken, setAccessToken] = useLocalStorage("accessToken");
  // const [refreshToken, setRefreshToken] = useLocalStorage("refreshToken");
  // const [userId, setUserId] = useLocalStorage("userId");
  const [accessToken, setAccessToken] = useLocalStorage("accessToken", "");
  const [refreshToken, setRefreshToken] = useLocalStorage("refreshToken", "");
  const [userId, setUserId] = useLocalStorage("userId", "");

  const refUsername = useRef<HTMLInputElement & { reset: () => void }>();
  const refPassword = useRef<HTMLInputElement & { reset: () => void }>();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);

  // useEffect(() => {
  //   // Khi toggle hiện login container ra thì clear các value đã nhập
  //   if (!show || showContainer) reset();
  // }, [show, showContainer]);

  const reset = () => {
    setError("");
    setProcessing(false);
    refUsername.current.reset();
    refPassword.current.reset();
  };

  useEffect(() => {
    if (toggle !== "signin") reset();
  }, [toggle]);

  const { mutate: signinMutation } = useMutation({
    mutationFn: (req: SigninRequest) => signin(req),
    onSuccess: (res) => {
      // queryClient.invalidateQueries(["info"]);
      // refetch();
      // onSuccess();
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setUserId(res.userId);
      setTimeout(() => {
        navigate("/");
      }, 100);
      //   localStorage.setItem("accessToken", res.data.accessToken);
      //   localStorage.setItem("refreshToken", res.data.refreshToken);
    },
    onError: (error) => {
      setProcessing(false);
      // setError("Username or password invalid. Try again please");
      setError(error.message);
    },
  });

  const signinCTA = () => {
    if (refUsername.current.value === "" || refPassword.current.value === "")
      return;

    setProcessing(true);
    signinMutation({
      username: refUsername.current.value,
      password: refPassword.current.value,
    });
  };

  const handlePressKey = (e) => {
    if (e.keyCode == 13) {
      signinCTA();
    }
  };

  return (
    <div className="flex flex-col gap-[3rem]">
      <CustomInput
        tabIndex={toggle === "signin" ? 1 : -1}
        inputRef={refUsername}
        type="text"
        label="Username"
        onKeyDown={handlePressKey}
      />
      <div className="relative">
        <CustomInput
          tabIndex={toggle === "signin" ? 2 : -1}
          inputRef={refPassword}
          className="pr-20"
          type={showPassword ? "text" : "password"}
          label="Password"
          onKeyDown={handlePressKey}
        />
        <div
          onClick={() => setShowPassword(!showPassword)}
          className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center 
              hover:text-[var(--main-color-light)] ${showPassword ? "fa-eye text-[var(--main-color)]" : "fa-eye-slash text-[var(--main-color)]"}`}
        ></div>
      </div>

      {isPhoneScreen() ? (
        <div className="flex w-full items-center justify-between text-base">
          <div
            className="cursor-pointer font-bold text-[var(--text-main-color-light)] hover:text-[var(--text-main-color)]"
            onClick={() => setToggle("signup")}
          >
            Create account
          </div>
          <div
            className="cursor-pointer font-bold text-[var(--text-main-color-light)] hover:text-[var(--text-main-color)]"
            onClick={() => setToggle("forgot")}
          >
            Forgot password?
          </div>
        </div>
      ) : (
        <div
          className="cursor-pointer self-end font-bold text-[var(--text-main-color-light)] hover:text-[var(--text-main-color)]"
          onClick={() => setToggle("forgot")}
        >
          Forgot password?
        </div>
      )}

      <ErrorComponent error={error} />

      <CustomButton
        processing={processing}
        title="Sign in"
        gradientWidth={`${isPhoneScreen() ? "104%" : "102%"}`}
        gradientHeight={`${isPhoneScreen() ? "120%" : "120%"}`}
        rounded="3rem"
        onClick={() => {
          signinCTA();
        }}
      />
    </div>
  );
};

export default SigninForm;
