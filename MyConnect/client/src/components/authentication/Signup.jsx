import React, { useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";

const Signup = ({ reference }) => {
  console.log("Signup calling");

  const refSignupContainer = useRef();
  const refSignup = useRef();

  const toggleSignup = () => {
    refSignupContainer.current?.classList.toggle("opacity-0");
    refSignup.current?.classList.toggle("translate-x-[150%]");
    reset();
  };

  const reset = () => {
    setName("");
    setUsername("");
    setPassword("");
    setErrorUsername("");
    setErrorPassword("");
    refUsername.current.reset();
    refPassword.current.reset();
    refName.current.reset();
  };

  const toggleLogin = () => {
    refSignupContainer.current?.classList.toggle("opacity-0");
    refSignup.current?.classList.toggle("translate-x-[150%]");
  };

  useEffect(() => {
    reference.refSignup.toggleSignup = toggleSignup;
    reference.refSignup.toggleLogin = toggleLogin;
  }, [toggleSignup, toggleLogin]);

  const refName = useRef();
  const refUsername = useRef();
  const refPassword = useRef();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const signup = () => {
    if (username === "" || password === "") return;
    if (password.length < 6) {
      setErrorPassword("Password min characters is 6");
      return;
    }

    const config = {
      method: "post",
      url: "api/auth/signup",
      data: {
        Name: name,
        Username: username,
        Password: password,
      },
    };
    HttpRequest(config)
      .then((res) => {
        setTimeout(() => {
          reference.toggleLogin();
        }, 100);
      })
      .catch((err) => {
        if (err.response.data.error === "UserExists") {
          setErrorUsername("User exists");
        }
      });
  };

  return (
    <div
      ref={refSignupContainer}
      className="absolute left-0 flex h-full w-[40%] justify-center overflow-hidden bg-white opacity-0 transition-all duration-500"
    >
      <div
        ref={refSignup}
        className="m-auto flex max-h-[80%] w-[70%] translate-x-[150%] flex-col gap-[5rem] bg-white transition-all duration-500"
      >
        <p className="text-5xl text-gray-600">Create account</p>

        <div className="flex flex-col gap-[5rem]">
          <div className="flex flex-col gap-[3rem] text-gray-600">
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
                if (text === "") setErrorUsername("");
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
                if (text === "") setErrorPassword("");
              }}
            />
          </div>

          <CustomButton
            title="Sign up"
            // className="mt-[4rem]"
            onClick={signup}
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
