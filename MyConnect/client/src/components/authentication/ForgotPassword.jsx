import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";

const ForgotPassword = ({ reference }) => {
  console.log("ForgotPassword calling");

  const refForgotPassword = useRef();

  const reset = () => {
    setUsername("");
    setPassword("");
    setErrorUsername("");
    setErrorPassword("");
    refUsername.current.reset();
    refPassword.current.reset();
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
    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Username: username,
      Password: password,
    });
    axios
      .post("api/users/forgot", body, { headers: headers })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setTimeout(() => {
          reference.switchLoginFromForgotPassword();
        }, 300);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error === "UserExists") {
          setErrorUsername("User exists");
        }
      });
  };

  useEffect(() => {
    reference.refForgotPassword.reset = reset;
  }, [reset]);

  return (
    <div
      ref={refForgotPassword}
      className="m-auto flex w-full flex-col gap-[5rem] bg-white duration-500"
    >
      <p className="text-5xl text-gray-600">Reset</p>

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
          className="cursor-pointer text-gray-400 hover:text-gray-500"
          onClick={reference.switchLoginFromForgotPassword}
        >
          Back to login
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
