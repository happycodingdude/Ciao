import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useLoading, useLocalStorage } from "../../hook/CustomHooks";
import { signin } from "../../hook/UserAPIs";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ErrorComponent from "../common/ErrorComponent";

const Login = (props) => {
  console.log("Login calling");
  const { show, showContainer, toggle } = props;

  const queryClient = useQueryClient();
  // const { refetch } = useInfo();
  const { setLoading } = useLoading();
  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");

  const refLogin = useRef();
  const refUsername = useRef();
  const refPassword = useRef();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Khi toggle hiện login container ra thì clear các value đã nhập
    if (showContainer) reset();
  }, [showContainer]);

  const reset = () => {
    // setToken(null);
    // setRefresh(null);
    // setError("");
    // refUsername.current.reset();
    // refPassword.current.reset();
  };

  const { mutate: signinMutation } = useMutation({
    mutationFn: ({ username, password }) => signin(username, password),
    onSuccess: (res) => {
      // setToken(res.access_token);
      // setRefresh(res.refresh_token);
      // refetch();
      queryClient.invalidateQueries(["info"]);
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
    <div
      ref={refLogin}
      data-state={show}
      className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] bg-[var(--bg-color)] duration-500 
      data-[state=false]:translate-y-[-100%] data-[state=true]:translate-y-0"
    >
      <p className="text-5xl">Sign in</p>

      <div className="flex flex-col gap-[3rem]">
        <CustomInput
          tabIndex="1"
          reference={refUsername}
          type="text"
          label="Username"
          onKeyDown={handlePressKey}
        />
        <div className="relative">
          <CustomInput
            tabIndex="2"
            reference={refPassword}
            className="pr-20"
            type={showPassword ? "text" : "password"}
            label="Password"
            onKeyDown={handlePressKey}
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center 
              hover:text-[var(--main-color-bold)] ${showPassword ? "fa-eye text-[var(--main-color)]" : "fa-eye-slash text-[var(--main-color)]"}`}
          ></div>
        </div>

        <div
          className="cursor-pointer self-end text-[var(--text-main-color-blur)] hover:text-[var(--text-main-color)]"
          onClick={() => {
            reset();
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
    </div>
  );
};

export default Login;
