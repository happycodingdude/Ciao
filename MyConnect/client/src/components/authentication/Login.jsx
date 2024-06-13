import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { login } from "../../hook/APIs";
import { useLoading, useLocalStorage } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ForgotPassword from "./ForgotPassword";

export const LoginContainer = (props) => {
  const { show } = props;
  const [showLogin, setShowLogin] = useState(true);
  const [showForgot, setShowFotgot] = useState(false);
  return (
    <div
      data-state={show}
      className="absolute right-0 flex h-full w-[40%] flex-col justify-center overflow-hidden bg-[var(--bg-color)] transition-all duration-500
      data-[state=false]:translate-x-[700%] data-[state=true]:translate-x-0"
    >
      <div className="relative">
        <Login
          show={showLogin}
          toggle={() => {
            setShowLogin(false);
            setShowFotgot(true);
          }}
        />
        <ForgotPassword
          show={showForgot}
          toggle={() => {
            setShowLogin(true);
            setShowFotgot(false);
          }}
        />
      </div>
    </div>
  );
};

const Login = (props) => {
  console.log("Login calling");
  const { show, toggle } = props;

  const queryClient = useQueryClient();
  const { setLoading } = useLoading();

  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");
  useEffect(() => {
    setToken(null);
    setRefresh(null);
  }, []);

  const refUsername = useRef();
  const refPassword = useRef();
  const refLogin = useRef();

  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const reset = () => {
    // refLogin.current.setAttribute("data-state", "false");
    // refUsername.current.reset();
    // refPassword.current.reset();
  };

  const { mutate: signinMutation } = useMutation({
    mutationFn: ({ username, password }) => login(username, password),
    onSuccess: (res) => {
      setToken(res.access_token);
      setRefresh(res.refresh_token);
      setTimeout(() => {
        queryClient.invalidateQueries(["info"]);
      }, 200);
    },
    onError: (error) => {
      setLoading(false);
      setError("Username or password invalid. Try again");
    },
  });

  const signin = () => {
    if (refUsername.current.value === "" || refPassword.current.value === "")
      return;

    setLoading(true);
    signinMutation({
      username: refUsername.current.value,
      password: refPassword.current.value,
    });
  };

  const handlePressKey = (e) => {
    if (e.keyCode == 13) {
      signin();
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

      <div className="flex flex-col">
        <div className="flex flex-col gap-[3rem]">
          <CustomInput
            reference={refUsername}
            type="text"
            label="Username"
            onKeyDown={handlePressKey}
          />
          <div className="relative">
            <CustomInput
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
        </div>

        <div
          className="mt-[1rem] cursor-pointer self-end text-[var(--text-main-color-blur)] hover:text-[var(--text-main-color)]"
          onClick={() => {
            reset();
            toggle();
          }}
        >
          Forgot password?
        </div>
        <div>
          <Tooltip title={error}>
            <div
              className={`fa fa-exclamation-triangle
          text-[var(--danger-text-color)] ${error === undefined ? "scale-y-0" : "scale-y-100"} `}
            ></div>
          </Tooltip>
        </div>
        <CustomButton
          title="Sign in"
          className="mt-[2rem]"
          onClick={() => {
            signin();
          }}
        />
      </div>
    </div>
  );
};

export default Login;
