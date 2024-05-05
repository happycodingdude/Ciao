import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ForgotPassword from "./ForgotPassword";

const Login = ({ reference }) => {
  console.log("Login calling");

  const navigate = useNavigate();
  const { login } = useAuth();

  const refLoginContainer = useRef();
  const refLoginWrapper = useRef();
  const refLogin = useRef();
  const refForgotPassword = useRef();

  const toggleSignup = () => {
    refLoginContainer.current?.classList.toggle("opacity-0");
    refLoginWrapper.current?.classList.toggle("translate-x-[-150%]");
    setTimeout(() => {
      refLoginWrapper.current.setAttribute("data-state", "show");
    }, 200);
  };

  const toggleLogin = () => {
    refLoginContainer.current?.classList.toggle("opacity-0");
    refLoginWrapper.current?.classList.toggle("translate-x-[-150%]");
    reset();
  };

  const reset = () => {
    setUsername("");
    setPassword("");
    setErrorUsername("");
    setErrorPassword("");
    refUsername.current.reset();
    refPassword.current.reset();
  };

  useEffect(() => {
    reference.refLogin.toggleSignup = toggleSignup;
    reference.refLogin.toggleLogin = toggleLogin;
  }, [toggleSignup, toggleLogin]);

  const [processing, setProcessing] = useState(false);
  const refUsername = useRef();
  const refPassword = useRef();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const signin = () => {
    if (username === "" && password === "") return;
    // setProcessing(true);

    HttpRequest({
      method: "post",
      url: "auth/api/auth/login",
      data: {
        Email: username,
        Password: password,
      },
    })
      .then((res) => {
        if (!res) return;
        // login(res.Token);
        // setTimeout(() => {
        //   navigate("/", { replace: true });
        // }, 500);
      })
      .catch((err) => {
        // if (err.response.data.error === "WrongPassword") {
        //   setErrorPassword("Wrong password");
        //   setErrorUsername("");
        // } else if (err.response.data.error === "NotFound") {
        //   setErrorUsername("User not found");
        //   setErrorPassword("");
        // }
        console.log(err);
      });
  };

  const handlePressKey = (e) => {
    if (e.keyCode == 13) {
      signin();
    }
  };

  const switchLoginFromForgotPassword = () => {
    refLoginWrapper.current.setAttribute("data-state", "show");
    reset();
  };

  return (
    <div
      ref={refLoginContainer}
      className="absolute right-0 flex h-full w-[40%] justify-center overflow-hidden bg-[var(--bg-color)] transition-all duration-500"
    >
      <div
        ref={refLoginWrapper}
        data-state="show"
        className="flex h-full w-[70%] flex-col transition-all duration-500 data-[state=hide]:translate-y-[-100%] 
        data-[state=show]:translate-y-0"
      >
        <div className="flex h-full w-full shrink-0 flex-col">
          <div
            ref={refLogin}
            className="my-auto flex w-full flex-col gap-[5rem] bg-[var(--bg-color)] duration-500"
          >
            <p className="text-5xl">Sign in</p>

            <div className="flex flex-col">
              <div className="flex flex-col gap-[3rem]">
                <CustomInput
                  ref={refUsername}
                  type="text"
                  label="Username"
                  value={username}
                  error={errorUsername}
                  onChange={(text) => {
                    setUsername(text);
                    if (text === "") setErrorUsername("");
                  }}
                  onKeyDown={handlePressKey}
                />
                <CustomInput
                  ref={refPassword}
                  type="password"
                  label="Password"
                  value={password}
                  error={errorPassword}
                  onChange={(text) => {
                    setPassword(text);
                    if (text === "") setErrorPassword("");
                  }}
                  onKeyDown={handlePressKey}
                />
              </div>

              <div
                className="mt-[1rem] cursor-pointer self-end text-[var(--text-main-color-blur)] hover:text-[var(--text-main-color)]"
                onClick={() => {
                  refForgotPassword.reset();
                  refLoginWrapper.current.setAttribute("data-state", "hide");
                }}
              >
                Forgot password?
              </div>

              <CustomButton
                title="Sign in"
                className="mt-[2rem]"
                onClick={signin}
                processing={processing}
              />
            </div>
          </div>
        </div>
        <div className="flex h-full w-full shrink-0 flex-col">
          <ForgotPassword
            reference={{
              refForgotPassword,
              switchLoginFromForgotPassword,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
