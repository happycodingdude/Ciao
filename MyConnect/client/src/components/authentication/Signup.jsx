import React, { useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";

const Signup = (props) => {
  const { show, toggle } = props;
  console.log("Signup calling");

  const refSignupContainer = useRef();
  const refSignup = useRef();

  const reset = () => {
    // setName("");
    // setUsername("");
    // setPassword("");
    // setErrorUsername(undefined);
    // setErrorPassword(undefined);
    // refUsername.current.reset();
    // refPassword.current.reset();
    // refName.current.reset();
  };

  const refName = useRef();
  const refUsername = useRef();
  const refPassword = useRef();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState();
  const [errorPassword, setErrorPassword] = useState();

  const signup = () => {
    if (username === "" || password === "") return;

    const config = {
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_SIGNUP,
      data: {
        Name: name,
        Username: username,
        Password: password,
      },
    };
    HttpRequest(config)
      .then((res) => {})
      .catch((err) => {
        if (
          err.errors.some((error) =>
            error.code.toLowerCase().includes("password"),
          )
        ) {
          let errMessage = "";
          err.errors.map((error) => (errMessage += error.description += "\n"));
          setErrorPassword(errMessage);
          setErrorUsername(undefined);
        } else if (
          err.errors.some((error) =>
            error.code.toLowerCase().includes("username"),
          )
        ) {
          let errMessage = "";
          err.errors.map((error) => (errMessage += error.description += "\n"));
          setErrorUsername(errMessage);
          setErrorPassword(undefined);
        }
      });
  };

  return (
    // <div
    //   ref={refSignupContainer}
    //   className="absolute left-0 flex h-full w-[40%] justify-center overflow-hidden bg-[var(--bg-color)] opacity-0 transition-all duration-500"
    // >
    <div
      ref={refSignup}
      data-state={show}
      className="absolute left-0 h-full w-[40%] bg-[var(--bg-color)] transition-all duration-500
      data-[state=false]:translate-x-[-700%] data-[state=true]:translate-x-0"
    >
      <div className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] bg-[var(--bg-color)]">
        <p className="text-5xl">Create account</p>

        <div className="flex flex-col gap-[5rem]">
          <div className="flex flex-col gap-[3rem]">
            <CustomInput
              ref={refName}
              type="text"
              label="Name"
              value={name}
              onChange={setName}
            />
            <CustomInput
              ref={refUsername}
              type="text"
              label="Username"
              value={username}
              error={errorUsername}
              onChange={(text) => {
                setUsername(text);
                if (text === "") setErrorUsername(undefined);
              }}
            />
            <CustomInput
              ref={refPassword}
              type="password"
              label="Password"
              value={password}
              error={errorPassword}
              onChange={(text) => {
                setPassword(text);
                if (text === "") setErrorPassword(undefined);
              }}
            />
          </div>

          <CustomButton title="Sign up" onClick={signup} />
        </div>
      </div>
    </div>
    // </div>
  );
};

export default Signup;
