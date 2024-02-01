import axios from "axios";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hook/useAuth";
import CustomInput from "../common/CustomInput";
import Signup from "./Signup";

const Login3 = () => {
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

  const refLogin = useRef();
  const refSignup = useRef();

  const toggleSignup = () => {
    // refLogin.current.classList.remove("animate-registration-show");
    // refLogin.current.classList.add("animate-registration-hide");
    refLogin.current?.classList.toggle("opacity-0");
    refSignup.toggleSignup();
  };

  const toggleLogin = () => {
    // refLogin.current.classList.remove("animate-registration-hide");
    // refLogin.current.classList.add("animate-registration-show");
    refLogin.current?.classList.toggle("opacity-0");
    reset();
  };

  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const handleLogin = () => {
    if (userName === "" && password === "") return;

    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Username: userName,
      Password: password,
    });
    axios
      .post("api/users/login", body, { headers: headers })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        auth.login(res.data.data.Token);
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
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

  return (
    <div className="flex w-full flex-col bg-white text-[clamp(1rem,1.2vw,2rem)]">
      {!isLogin ? (
        <section className="flex h-full w-full">
          <div className="grow rounded-r-[5rem] bg-red-300"></div>
          <div className="relative flex w-[40%] justify-center bg-white">
            <div
              ref={refLogin}
              className="m-auto flex h-[70%] w-[70%] flex-col gap-[15%] rounded-[1rem] bg-white duration-[1s]"
            >
              <div className="flex flex-col">
                <p className="text-2xl font-semibold text-gray-600">
                  Welcome back
                </p>
                <p className="text-base text-gray-400">Have a nice day!</p>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-col gap-[3rem] text-gray-600">
                  <CustomInput
                    type="text"
                    label="Username"
                    value={userName}
                    error={errorUsername}
                    onChange={(text) => {
                      setUsername(text);
                      if (text === "") setErrorUsername("");
                    }}
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
                  ></CustomInput>
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
    </div>
  );
};

export default Login3;
