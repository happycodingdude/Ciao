import React, { useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";

const ForgotPassword = (props) => {
  console.log("ForgotPassword calling");
  const { show, toggle } = props;

  const refForgotPassword = useRef();

  const reset = () => {
    // setUsername("");
    // setPassword("");
    // setErrorUsername(undefined);
    // setErrorPassword(undefined);
    // refUsername.current.reset();
    // refPassword.current.reset();
    // refForgotPassword.current.setAttribute("data-state", "false");
  };

  const refUsername = useRef();
  const refPassword = useRef();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const resetPassword = () => {
    if (username === "" || password === "") return;
    if (password.length < 6) {
      setErrorPassword("Password min characters is 6");
      return;
    }

    const config = {
      method: "post",
      url: "api/auth/forgot",
      data: {
        Username: username,
        Password: password,
      },
    };
    HttpRequest(config)
      .then((res) => {
        setTimeout(() => {
          toggle();
        }, 300);
      })
      .catch((err) => {
        if (err.response.data.error === "NotFound") {
          setErrorUsername("User not found");
        }
      });
  };

  return (
    <div
      ref={refForgotPassword}
      data-state={show}
      className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] bg-[var(--bg-color)] duration-500 
        data-[state=false]:translate-y-0 data-[state=true]:translate-y-[-100%]"
    >
      <p className="text-5xl">Reset</p>

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
        ></CustomInput>
        <CustomInput
          ref={refPassword}
          type="password"
          label="New password"
          value={password}
          error={errorPassword}
          onChange={(text) => {
            setPassword(text);
            if (text === "") setErrorPassword("");
          }}
        ></CustomInput>
      </div>
      <div className="flex flex-col gap-[1rem]">
        <CustomButton title="Reset" onClick={resetPassword} />
        <div
          className="cursor-pointer text-[var(--text-main-color-blur)] hover:text-[var(--text-main-color)]"
          onClick={() => {
            reset();
            toggle();
          }}
        >
          Back to login
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
