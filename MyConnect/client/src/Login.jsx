import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../src/hook/useAuth";
import Signup from "./Signup";

const Login = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const from = location.state?.from?.pathname || "/";
  // console.log(from);
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
    refUsername.current?.focus();
  }, []);

  // const errorMessageRef = useRef(null);
  // const [retry, setRetry] = useState(0);

  const handleLogin = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Username: refUsername.current.value,
      Password: refPassword.current.value,
    });
    axios
      .post("api/user/login", body, { headers: headers })
      .then((res) => {
        if (res.status === 200) {
          // errorMessageRef.current.classList.remove("active");
          auth.login(res.data.data.Token);
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
        // if (err.response.data.error === "WrongPassword") {
        //   setRetry(err.response.data.data.RemainRetry);
        //   errorMessageRef.current.classList.add("active");
        // }
      });
  };

  const refSignup = useRef();
  const toggleSignup = () => {
    refLogin.current.classList.add("animate-registration-hide");
    setTimeout(() => {
      refLogin.current.classList.remove("animate-registration-hide");
    }, 1000);
    refSignup.toggleSignup();
  };

  const toggleLogin = () => {
    refLogin.current.classList.add("animate-registration-show");
    setTimeout(() => {
      refLogin.current.classList.remove("animate-registration-show");
    }, 1000);
  };

  return (
    <>
      {!isLogin ? (
        <section className="relative flex h-full justify-center gap-[2rem]">
          <div
            ref={refLogin}
            className="absolute bottom-0 top-0 z-10 m-auto flex flex-col rounded-[1rem]
          bg-white px-[3rem] py-[2rem] shadow-[0_0_20px_-5px_#cc9dff] duration-[1s]
          laptop:h-[45rem] laptop:w-[30rem]
          [&>*:not(:first-child)]:mt-[2rem]"
          >
            <p className="text-center text-3xl font-semibold uppercase">
              Login
            </p>

            <div className="flex flex-col gap-[1rem] text-gray-600">
              <p className="font-bold">Username</p>
              <input
                className="rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] focus:outline-none"
                ref={refUsername}
                type="text"
                placeholder="Type your username"
              />
              <p className="font-bold">Password</p>
              <input
                className="rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] focus:outline-none"
                type="password"
                ref={refPassword}
                placeholder="Type your password"
              />
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
              <a onClick={toggleSignup} href="#" className="text-blue-500">
                Sign Up
              </a>
            </div>
            {/* <span ref={errorMessageRef} className="error-message">
              Retry times remain: {retry}
            </span>
            </div> */}
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
