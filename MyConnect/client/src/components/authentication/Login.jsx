import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpRequest } from "../../common/Utility";
import { useLocalStorage } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ForgotPassword from "./ForgotPassword";

const Login = ({ reference }) => {
  console.log("Login calling");

  const navigate = useNavigate();

  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");

  const refLoginContainer = useRef();
  const refLoginWrapper = useRef();
  const refLogin = useRef();
  const refForgotPassword = useRef();

  // Transition
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
    // setError(undefined);
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

  const { mutate: signin } = useMutation({
    mutationKey: ["signin"],
    mutationFn: async () => {
      if (refUsername.current.value === "" && refUsername.current.value === "")
        return;

      setProcessing(true);
      const result = await HttpRequest({
        method: "post",
        url: import.meta.env.VITE_ENDPOINT_SIGNIN,
        data: {
          Username: refUsername.current.value,
          Password: refPassword.current.value,
        },
        alert: true,
      });
      return result.headers;
    },
    onSuccess: (res) => {
      setToken(res.access_token);
      setRefresh(res.refresh_token);
      setTimeout(() => {
        setProcessing(false);
        navigate("/", { replace: true });
      }, 1000);
    },
    onError: (error) => {
      setTimeout(() => {
        setProcessing(false);
      }, 500);
    },
  });

  const switchLoginFromForgotPassword = () => {
    refLoginWrapper.current.setAttribute("data-state", "show");
    reset();
  };

  const handlePressKey = (e) => {
    if (e.keyCode == 13) signin();
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
                  reference={refUsername}
                  type="text"
                  label="Username"
                  onKeyDown={handlePressKey}
                />
                <CustomInput
                  reference={refPassword}
                  type="password"
                  label="Password"
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
              {/* <div>
                <Tooltip title={error}>
                  <div
                    className={`fa fa-exclamation-triangle
          text-[var(--danger-text-color)] ${error === undefined ? "scale-y-0" : "scale-y-100"} `}
                  ></div>
                </Tooltip>
              </div> */}
              <CustomButton
                title="Sign in"
                className="mt-[2rem]"
                // onClick={signin}
                onClick={() => {
                  signin();
                }}
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
