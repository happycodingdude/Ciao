import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import CustomInput from "../common/CustomInput";

const Signup = ({ reference }) => {
  const refSignupContainer = useRef();
  const refSignup = useRef();

  const toggleSignup = () => {
    // refSignup.current.classList.remove("animate-registration-hide");
    // refSignup.current?.classList.add("animate-registration-show");
    refSignupContainer.current?.classList.toggle("opacity-0");
    refSignup.current?.classList.toggle("translate-x-[150%]");
    reset();
  };

  const toggleLogin = () => {
    refSignupContainer.current?.classList.toggle("opacity-0");
    refSignup.current?.classList.toggle("translate-x-[150%]");
    // reference.toggleLogin();
  };

  useEffect(() => {
    reference.refSignup.toggleSignup = toggleSignup;
    reference.refSignup.toggleLogin = toggleLogin;
  }, [toggleSignup]);

  const [name, setName] = useState("");
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const handleSignup = () => {
    if (userName === "" || password === "") return;
    if (password.length < 6) {
      setErrorPassword("Password min characters is 6");
      return;
    }
    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Name: name,
      Username: userName,
      Password: password,
    });
    axios
      .post("api/users/signup", body, { headers: headers })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setTimeout(() => {
          reference.toggleLogin()();
        }, 100);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.error === "UserExists") {
          setErrorUsername("User exists");
        }
      });
  };

  const reset = () => {
    setName("");
    setUsername("");
    setPassword("");
    setErrorUsername("");
    setErrorPassword("");
  };

  return (
    <div
      ref={refSignupContainer}
      className="absolute left-0 flex h-full w-[40%] justify-center overflow-hidden bg-white opacity-0 transition-all duration-500"
    >
      <div
        ref={refSignup}
        className="m-auto flex h-[70%] w-[70%] translate-x-[150%] flex-col gap-[15%] bg-white transition-all duration-500"
      >
        <p className="text-5xl text-gray-600">Create account</p>

        <div className="flex flex-col">
          <div className="flex flex-col gap-[3rem] text-gray-600">
            <CustomInput
              type="text"
              label="Name"
              onChange={setName}
            ></CustomInput>
            <CustomInput
              type="text"
              label="Username"
              error={errorUsername}
              onChange={(text) => {
                setUsername(text);
                if (text === "") setErrorUsername("");
              }}
            ></CustomInput>
            <CustomInput
              type="password"
              label="Password"
              error={errorPassword}
              onChange={(text) => {
                setPassword(text);
                if (text === "") setErrorPassword("");
              }}
            ></CustomInput>
          </div>

          <div
            className="mt-[4rem] w-full cursor-pointer self-center rounded-[.4rem] bg-gradient-to-r 
            from-purple-300 to-purple-400 bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
            font-medium text-white shadow-[0_3px_3px_-2px_#d3adfb] 
            transition-all duration-500 
            hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_#cea1fd]"
            onClick={handleSignup}
          >
            Sign up
          </div>

          {/* <div
            className="mt-[2rem] cursor-pointer self-center text-purple-400 hover:text-purple-500"
            onClick={backToLogin}
          >
            Back to login
          </div> */}
          {/* <div className="mt-[2rem] flex items-center justify-center gap-[.5rem]">
            <p className="text-gray-400">Or</p>
            <div
              onClick={backToLogin}
              className="cursor-pointer text-purple-400 hover:text-purple-500"
            >
              Login
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Signup;
