import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hook/useAuth";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ForgotPassword from "./ForgotPassword";

const Login = ({ reference }) => {
  console.log("Login calling");

  const navigate = useNavigate();
  const auth = useAuth();

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
        }, 500);
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
                ></CustomInput>
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
                ></CustomInput>
              </div>

              <div
                className="mt-[1rem] cursor-pointer self-end text-gray-400 hover:text-gray-500"
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
