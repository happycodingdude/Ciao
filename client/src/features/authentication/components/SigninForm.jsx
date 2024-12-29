import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ErrorComponent from "../common/ErrorComponent";
import signin from "../services/signin";

const SigninForm = (props) => {
  console.log("SigninForm calling");
  const { show, showContainer, toggle } = props;

  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useLocalStorage("accessToken");
  const [refreshToken, setRefreshToken] = useLocalStorage("refreshToken");

  const refUsername = useRef();
  const refPassword = useRef();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Khi toggle hiện login container ra thì clear các value đã nhập
    if (!show || showContainer) reset();
  }, [show, showContainer]);

  const reset = () => {
    setError("");
    setProcessing(false);
    refUsername.current.reset();
    refPassword.current.reset();
  };

  const { mutate: signinMutation } = useMutation({
    mutationFn: ({ username, password }) => signin(username, password),
    onSuccess: (res) => {
      // queryClient.invalidateQueries(["info"]);
      // refetch();
      // onSuccess();
      navigate("/");
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      //   localStorage.setItem("accessToken", res.data.accessToken);
      //   localStorage.setItem("refreshToken", res.data.refreshToken);
    },
    onError: (error) => {
      setProcessing(false);
      setError("Username or password invalid. Try again please");
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
        tabIndex={show && showContainer ? "1" : "-1"}
        reference={refUsername}
        type="text"
        label="Username"
        onKeyDown={handlePressKey}
      />
      <div className="relative">
        <CustomInput
          tabIndex={show && showContainer ? "2" : "-1"}
          reference={refPassword}
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

      <div
        className="cursor-pointer self-end text-[var(--text-main-color-light)] hover:text-[var(--text-main-color)]"
        onClick={() => {
          toggle();
        }}
      >
        Forgot password?
      </div>

      <ErrorComponent error={error} />

      <CustomButton
        processing={processing}
        title="Sign in"
        onClick={() => {
          signinCTA();
        }}
      />
    </div>
  );
};

export default SigninForm;
