import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import CustomInput from "../common/CustomInput";

const Signup1 = ({ reference }) => {
  const refSignup = useRef();

  const toggleSignup = () => {
    // refSignup.current.classList.remove("animate-registration-hide");
    // refSignup.current?.classList.add("animate-registration-show");
    refSignup.current?.classList.toggle("scale-100");
    refSignup.current?.classList.toggle("z-10");
    refSignup.current?.classList.toggle("opacity-100");
    reset();
  };

  useEffect(() => {
    reference.refSignup.toggleSignup = toggleSignup;
  }, [toggleSignup]);

  const backToLogin = () => {
    refSignup.current?.classList.toggle("scale-100");
    refSignup.current?.classList.toggle("z-10");
    refSignup.current?.classList.toggle("opacity-100");
    reference.toggleLogin();
  };

  const [name, setName] = useState("");
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");

  const handleSignup = () => {
    if (userName === "" || password === "") return;

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
          backToLogin();
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
  };

  return (
    <>
      <div
        ref={refSignup}
        className="absolute bottom-0 top-0 m-auto flex h-[70%] w-[70%] origin-[75%_92%] scale-0 flex-col gap-[15%] rounded-[1rem] bg-white duration-[.2s]"
      >
        <p className="text-2xl font-semibold text-gray-600">Hello, friend!</p>

        <div className="flex flex-col">
          <div className="flex flex-col gap-[3rem] text-gray-600">
            <CustomInput
              type="text"
              label="Name"
              value={name}
              onChange={setName}
            ></CustomInput>
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
              onChange={setPassword}
            ></CustomInput>
          </div>

          <div
            className="mt-[4rem] w-full cursor-pointer self-center rounded-[.4rem] bg-gradient-to-r 
            from-purple-300 to-purple-400 bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
            font-medium text-white shadow-[0_3px_3px_-2px_#d3adfb] 
            transition-all duration-200 
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
          <div className="mt-[2rem] flex items-center justify-center gap-[.5rem]">
            <p className="text-gray-400">Or</p>
            <div
              onClick={backToLogin}
              className="cursor-pointer text-purple-400 hover:text-purple-500"
            >
              Login
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup1;
