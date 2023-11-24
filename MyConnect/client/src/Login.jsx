import axios from "axios";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../src/hook/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  console.log(from);
  const auth = useAuth();

  const refUsername = useRef();
  const refPassword = useRef();

  const [isLogin, setIsLogin] = useState(false);
  useLayoutEffect(() => {
    if (auth.user) {
      setIsLogin(true);
      navigate("/", { replace: true });
    }
  }, []);

  useEffect(() => {
    refUsername.current?.focus();
  }, []);

  // const errorMessageRef = useRef(null);
  // const [retry, setRetry] = useState(0);

  const handleSubmit = () => {
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
            navigate(from, { replace: true });
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

  return (
    <>
      {!isLogin ? (
        <section className="flex h-full justify-center">
          <div
            className="relative m-auto
          flex h-[clamp(40rem,80%,50rem)] w-[clamp(30rem,50%,40rem)] flex-col rounded-[1rem]
          bg-white px-[4rem] py-[2rem]
          [&>*:not(:first-child)]:mt-[2rem]"
          >
            <span className="text-center text-3xl font-bold">Login</span>

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
              onClick={handleSubmit}
            >
              Login
            </button>
            {/* <span ref={errorMessageRef} className="error-message">
              Retry times remain: {retry}
            </span>

            <div className="other">
              <div className="other-login">
                <p>Or login with</p>
                <div className="icon">
                  <a href="#" className="facebook">
                    <i className="fa fa-facebook"></i>
                  </a>
                  <a href="#" className="twitter">
                    <i className=" fa fa-twitter"></i>
                  </a>
                  <a href="#" className="google">
                    <i className=" fa fa-google"></i>
                  </a>
                </div>
              </div>

              <div className="signup">
                <p>Don't have an account?</p>
                <a href="#" className="cta-signup">
                  Sign Up
                </a>
              </div>
            </div> */}
          </div>
        </section>
      ) : (
        ""
      )}
    </>
  );
};

export default Login;
