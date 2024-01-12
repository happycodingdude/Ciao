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
      // refLogin.current.classList.toggle("opacity-0");
    }, 1000);
    refSignup.toggleSignup();
  };

  const toggleLogin = () => {
    refLogin.current.classList.add("animate-registration-show");
    setTimeout(() => {
      refLogin.current.classList.remove("animate-registration-show");
      // refLogin.current.classList.toggle("opacity-0");
    }, 1000);
  };

  return (
    <>
      {!isLogin ? (
        <section className="relative flex h-full justify-center gap-[2rem]">
          <div
            ref={refLogin}
            className="absolute bottom-0 top-0 z-10 m-auto flex h-[clamp(40rem,80%,50rem)]
          w-[clamp(30rem,50%,40rem)] flex-col
          rounded-[1rem] bg-white px-[4rem]
          py-[2rem]
          duration-[1s] [&>*:not(:first-child)]:mt-[2rem]"
          >
            <span className="text-center text-3xl font-bold uppercase">
              login
            </span>

            <div className="flex flex-col gap-[1rem]">
              <span className="">Username</span>
              <input
                className="rounded-[.5rem] border-[.1rem] border-gray-400 focus:outline-none"
                ref={refUsername}
                type="text"
                placeholder="Type your username"
              />
              <span className="">Password</span>
              <input
                className="rounded-[.5rem] border-[.1rem] border-gray-400 focus:outline-none"
                type="password"
                ref={refPassword}
                placeholder="Type your password"
              />
            </div>

            <a href="#" className="self-end text-blue-500">
              Forgot password?
            </a>

            <button
              className="w-[50%] self-center rounded-[1rem] border-[.2rem] border-gray-400 uppercase"
              onClick={handleLogin}
            >
              Login
            </button>
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
