import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Signup from "./Signup";
import useAuth from "./hook/useAuth";

const Login1 = () => {
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
  const refPhPassword = useRef();

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
      ref.current.classList.remove("scale-x-100");
      ref.current.classList.add("scale-x-0");
    } else {
      ref.current.classList.remove("scale-x-0");
      ref.current.classList.add("scale-x-100");
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
        <section className="flex h-full w-full">
          <div className="grow rounded-r-[5rem] bg-red-300"></div>
          <div className="relative flex w-[40%] justify-center rounded-l-[2rem] bg-white">
            <div
              ref={refLogin}
              className="z-10 m-auto flex h-[70%] w-[70%] flex-col gap-[15%] rounded-[1rem] bg-white duration-[1s]"
            >
              <div className="flex flex-col">
                <p className="text-2xl font-semibold text-gray-600">
                  Welcome back
                </p>
                <p className="text-base text-gray-400">Have a nice day!</p>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-col gap-[2rem] text-gray-600">
                  <div className="relative">
                    <input
                      className="focus w-full rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] 
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
                    <p
                      ref={refUsernameError}
                      className="pointer-events-none absolute right-[3%] top-[50%] origin-right translate-y-[-50%] scale-x-0 overflow-hidden text-red-500 transition-all duration-200"
                    >
                      {usernameErr}
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      className="focus w-full rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] 
                  outline-none transition-all duration-200"
                      ref={refPassword}
                      type="text"
                      onChange={handleInputChange}
                      onFocus={(e) => handleFocus(e, refPhPassword, true)}
                      onBlur={(e) => handleFocus(e, refPhPassword)}
                    />
                    <p
                      ref={refPhPassword}
                      className="pointer-events-none absolute left-[3%] top-[50%] z-10 origin-left translate-y-[-50%] px-[.5rem] text-gray-400 transition-all duration-200"
                    >
                      Password
                    </p>
                    <p
                      ref={refPasswordError}
                      className="pointer-events-none absolute right-[3%] top-[50%] origin-right translate-y-[-50%] scale-x-0 overflow-hidden text-red-500 transition-all duration-200"
                    >
                      {passwordErr}
                    </p>
                  </div>
                </div>

                <div className="mt-[1rem] cursor-pointer self-end text-gray-400 hover:text-gray-500">
                  Forgot password?
                </div>

                <div
                  className="mt-[2rem] w-full cursor-pointer self-center rounded-[.4rem] bg-gradient-to-r 
              from-purple-300 to-purple-400 bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
              font-medium text-white shadow-[0_3px_3px_-2px_#d3adfb] 
              transition-all duration-200 
              hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_#cea1fd]"
                  onClick={handleLogin}
                >
                  Sign in
                </div>

                <div className="mt-[2rem] flex items-center justify-center gap-[1rem]">
                  <p className="text-gray-400">Don't have an account?</p>
                  <div
                    onClick={toggleSignup}
                    className="cursor-pointer text-purple-400 hover:text-purple-500"
                  >
                    Sign Up
                  </div>
                </div>
              </div>
            </div>
            <Signup reference={{ refSignup, toggleLogin }}></Signup>
          </div>
        </section>
      ) : (
        ""
      )}
    </>
  );
};

export default Login1;
