import axios from "axios";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hook/useAuth";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ForgotPassword from "./ForgotPassword";
import Signup from "./Signup";

const Login = () => {
  console.log("Login calling");

  const navigate = useNavigate();
  const auth = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  useLayoutEffect(() => {
    if (auth.id) {
      setIsLogin(true);
      navigate(-1, { replace: true });
    }
  }, []);

  const refBgContainer = useRef();
  const refBgSignUpLabelContainer = useRef();
  const refBgSignInLabelContainer = useRef();
  const refLoginContainer = useRef();
  const refLoginWrapper = useRef();
  const refLogin = useRef();
  const refSignup = useRef();
  const refForgotPassword = useRef();

  const toggleSignup = () => {
    // Animate background container
    refBgContainer.current?.classList.toggle("left-[40%]");
    refBgContainer.current?.classList.toggle("rounded-br-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tr-[20rem]");
    refBgContainer.current?.classList.toggle("rounded-r-0");
    refBgContainer.current?.classList.toggle("rounded-bl-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tl-[20rem]");
    // Animate background text
    refBgSignUpLabelContainer.current?.classList.toggle("translate-x-[-200%]");
    refBgSignUpLabelContainer.current?.classList.toggle("opacity-0");
    refBgSignInLabelContainer.current?.classList.toggle("translate-x-[-150%]");
    refBgSignInLabelContainer.current?.classList.toggle("opacity-0");
    // Animate form
    refLoginContainer.current?.classList.toggle("opacity-0");
    refLoginWrapper.current?.classList.toggle("translate-x-[-150%]");
    refSignup.toggleSignup();
  };

  const toggleLogin = () => {
    // Animate background container
    refBgContainer.current?.classList.toggle("left-[40%]");
    refBgContainer.current?.classList.toggle("rounded-br-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tr-[20rem]");
    refBgContainer.current?.classList.toggle("rounded-r-0");
    refBgContainer.current?.classList.toggle("rounded-bl-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tl-[20rem]");
    // Animate background text
    refBgSignUpLabelContainer.current?.classList.toggle("translate-x-[-200%]");
    refBgSignUpLabelContainer.current?.classList.toggle("opacity-0");
    refBgSignInLabelContainer.current?.classList.toggle("translate-x-[-150%]");
    refBgSignInLabelContainer.current?.classList.toggle("opacity-0");
    // Animate form
    refLoginContainer.current?.classList.toggle("opacity-0");
    refLoginWrapper.current?.classList.toggle("translate-x-[-150%]");
    refSignup.toggleLogin();
    // Reset form value
    reset();
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const handleLogin = () => {
    if (username === "" && password === "") return;

    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Username: username,
      Password: password,
    });
    axios
      .post("api/users/login", body, { headers: headers })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        auth.login(res.data.data.Token);
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 300);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error === "WrongPassword") {
          setErrorPassword("Wrong password");
          setErrorUsername("");
        } else if (err.response.data.error === "NotFound") {
          setErrorUsername("User not found");
          setErrorPassword("");
        }
      });
  };

  const reset = () => {
    setUsername("");
    setPassword("");
    setErrorUsername("");
    setErrorPassword("");
  };

  const handlePressKey = (e) => {
    if (e.keyCode == 13) {
      handleLogin();
    }
  };

  const switchLoginFromForgotPassword = () => {
    refLoginWrapper.current.setAttribute("data-state", "show");
    reset();
  };

  return (
    <div className="flex w-full flex-col bg-white text-[clamp(1rem,1.2vw,2rem)]">
      {!isLogin ? (
        <section className="relative flex h-full w-full transition-all duration-500">
          <div
            ref={refBgContainer}
            className="absolute left-0 z-10 h-full w-[60%] overflow-hidden rounded-br-[10rem] rounded-tr-[20rem] bg-red-300 transition-all duration-500"
          ></div>
          <div
            ref={refLoginContainer}
            className="absolute right-0 flex h-full w-[40%] justify-center overflow-hidden bg-white transition-all duration-500"
          >
            <div
              ref={refLoginWrapper}
              data-state="show"
              className="flex h-full w-[70%] flex-col transition-all duration-500 data-[state=hide]:translate-y-[-100%] data-[state=show]:translate-y-0"
            >
              <div className="flex h-full w-full shrink-0 flex-col">
                <div
                  ref={refLogin}
                  className="my-auto flex w-full flex-col gap-[5rem] bg-white duration-500"
                >
                  <p className="text-5xl text-gray-600">Sign in</p>

                  <div className="flex flex-col">
                    <div className="flex flex-col gap-[3rem] text-gray-600">
                      <CustomInput
                        type="text"
                        label="Username"
                        value={username}
                        error={errorUsername}
                        onChange={(text) => {
                          setUsername(text);
                          if (text === "") setErrorUsername("");
                        }}
                        onKeyDown={handlePressKey}
                      ></CustomInput>
                      <CustomInput
                        type="password"
                        label="Password"
                        value={password}
                        error={errorPassword}
                        onChange={(text) => {
                          setPassword(text);
                          if (text === "") setErrorPassword("");
                        }}
                        onKeyDown={handlePressKey}
                      ></CustomInput>
                    </div>

                    <div
                      className="mt-[1rem] cursor-pointer self-end text-gray-400 hover:text-gray-500"
                      onClick={() => {
                        refForgotPassword.reset();
                        refLoginWrapper.current.setAttribute(
                          "data-state",
                          "hide",
                        );
                      }}
                    >
                      Forgot password?
                    </div>

                    <CustomButton
                      title="Sign in"
                      className="mt-[2rem]"
                      onClick={handleLogin}
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
          <Signup reference={{ refSignup, toggleLogin }}></Signup>

          <div
            ref={refBgSignUpLabelContainer}
            className="absolute left-[10%] top-1/2 z-10 flex translate-y-[-50%] flex-col items-center gap-[2rem] text-center text-white transition-all duration-500"
          >
            <p className="text-7xl">Hello, friend</p>
            <div
              onClick={toggleSignup}
              className="cursor-pointer rounded-[1rem] border-[.2rem] border-white px-[5rem] py-[.5rem] text-2xl transition-all duration-500 hover:bg-[rgba(255,145,145,0.41)] hover:shadow-[0_3px_10px_-2px_white]"
            >
              Sign up
            </div>
          </div>
          <div
            ref={refBgSignInLabelContainer}
            className="absolute right-[-30%] top-1/2 z-10 flex translate-y-[-50%] flex-col items-center gap-[2rem] text-center text-white opacity-0 transition-all duration-500"
          >
            <p className="text-7xl">Welcome back</p>
            <div
              onClick={toggleLogin}
              className="cursor-pointer rounded-[1rem] border-[.2rem] border-white px-[5rem] py-[.5rem] text-2xl transition-all duration-500 hover:bg-[rgba(255,145,145,0.41)] hover:shadow-[0_3px_10px_-2px_white]"
            >
              Sign in
            </div>
          </div>
        </section>
      ) : (
        ""
      )}
    </div>
  );
};

export default Login;
