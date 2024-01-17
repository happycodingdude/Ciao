import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../src/hook/useAuth";
import Signup from "./Signup";

const Login = () => {
  console.log("Login calling");
  const navigate = useNavigate();
  const auth = useAuth();

  const refUsername = useRef();
  const refPassword = useRef();

  const [isLogin, setIsLogin] = useState(false);
  useLayoutEffect(() => {
    if (auth.id) {
      setIsLogin(true);
      navigate(-1, { replace: true });
    }
  }, []);

  const refLogin = useRef();
  useEffect(() => {
    // refUsername.current?.focus();
  }, []);

  const refUsernameError = useRef();
  const [usernameErr, setUsernameErr] = useState("");
  const refPasswordError = useRef();
  const [passwordErr, setPasswordErr] = useState("");

  const refPhUsername = useRef();

  const handleLogin = () => {
    const username = refUsername.current.value;
    const password = refPassword.current.value;
    if (username === "" && password === "") return;

    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Username: refUsername.current.value,
      Password: refPassword.current.value,
    });
    axios
      .post("api/users/login", body, { headers: headers })
      .then((res) => {
        if (res.status === 200) {
          auth.login(res.data.data.Token);
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error === "WrongPassword") {
          toggleError("Wrong password", setPasswordErr, refPasswordError);
          toggleError("", setUsernameErr, refUsernameError);
        } else if (err.response.data.error === "NotFound") {
          toggleError("User not found", setUsernameErr, refUsernameError);
          toggleError("", setPasswordErr, refPasswordError);
        }
      });
  };

  const toggleError = (error, action, ref) => {
    action(error);
    if (error === "") {
      ref.current.classList.remove("h-[2rem]");
      ref.current.classList.add("h-0");
    } else {
      ref.current.classList.remove("h-0");
      ref.current.classList.add("h-[2rem]");
    }
  };

  const handleInputChange = () => {
    const username = refUsername.current.value;
    const password = refPassword.current.value;
    if (username === "" && password === "") {
      toggleError("", setUsernameErr, refUsernameError);
      toggleError("", setPasswordErr, refPasswordError);
    }
  };

  const handleFocus = (e, ref, focus) => {
    if (e.target.value !== "") return;
    if (focus === true) {
      e.target.classList.add("input-focus");
      ref.current.classList.add("input-focus-placeholder");
    } else {
      e.target.classList.remove("input-focus");
      ref.current.classList.remove("input-focus-placeholder");
    }
  };

  const refSignup = useRef();
  const toggleSignup = () => {
    refLogin.current.classList.remove("animate-registration-show");
    refLogin.current.classList.add("animate-registration-hide");
    refSignup.toggleSignup();
  };

  const toggleLogin = () => {
    refLogin.current.classList.remove("animate-registration-hide");
    refLogin.current.classList.add("animate-registration-show");
  };

  return (
    <>
      {!isLogin ? (
        <section className="relative flex h-full justify-center gap-[2rem]">
          <div
            ref={refLogin}
            className="absolute bottom-0 top-0 z-10 m-auto flex flex-col rounded-[1rem]
          bg-white px-[3rem] py-[2rem] shadow-[0_0_20px_-5px_#cc9dff] duration-[1s]
          laptop:h-[80%] laptop:w-[30rem]
          [&>*:not(:first-child)]:mt-[2rem]"
          >
            <p className="text-center text-3xl font-semibold uppercase">
              Login
            </p>

            <div className="flex flex-col gap-[1rem] text-gray-600">
              <div className="relative">
                <input
                  className="focus peer w-full rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] 
                  outline-none transition-all duration-200"
                  ref={refUsername}
                  type="text"
                  onChange={handleInputChange}
                  onFocus={(e) => handleFocus(e, refPhUsername, true)}
                  onBlur={(e) => handleFocus(e, refPhUsername)}
                />
                <p
                  ref={refPhUsername}
                  className="pointer-events-none absolute left-[3%] top-[50%] z-10 origin-left translate-y-[-50%] px-[.5rem] text-gray-400 transition-all duration-200"
                >
                  Username
                </p>
              </div>
              <label
                ref={refUsernameError}
                className="h-0 overflow-hidden text-red-500 duration-200"
              >
                {usernameErr}
              </label>
              <input
                className="rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] focus:outline-none"
                type="password"
                ref={refPassword}
                placeholder="Password"
                onChange={handleInputChange}
              />
              <label
                ref={refPasswordError}
                className="h-0 overflow-hidden text-red-500 duration-200"
              >
                {passwordErr}
              </label>
            </div>

            <div
              className="w-full cursor-pointer self-center rounded-[.4rem] 
              bg-gradient-to-r from-purple-100 to-purple-200 bg-[size:200%] bg-[position:0%_0%] py-[1rem]
              text-center font-medium uppercase shadow-[0_3px_3px_-2px_#e4cbff] 
              transition-all duration-200 
              hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_#e4cbff]"
              onClick={handleLogin}
            >
              Login
            </div>

            <div className="cursor-pointer self-center text-blue-500">
              Forgot password?
            </div>

            <div className="flex flex-col items-center">
              <p>Don't have an account?</p>
              <div
                onClick={toggleSignup}
                className="cursor-pointer text-blue-500"
              >
                Sign Up
              </div>
            </div>
          </div>
          <Signup reference={{ refSignup, toggleLogin }}></Signup>
        </section>
      ) : (
        ""
      )}
    </>
  );
};

export default Login;
