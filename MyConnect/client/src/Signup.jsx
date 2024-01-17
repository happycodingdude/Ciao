import axios from "axios";
import React, { useEffect, useRef } from "react";

const Signup = ({ reference }) => {
  const refName = useRef();
  const refUsername = useRef();
  const refPassword = useRef();

  const refSignup = useRef();

  const toggleSignup = () => {
    refSignup.current.classList.remove("animate-registration-hide");
    refSignup.current?.classList.add("animate-registration-show");
  };

  useEffect(() => {
    reference.refSignup.toggleSignup = toggleSignup;
  }, [toggleSignup]);

  const backToLogin = () => {
    refSignup.current.classList.remove("animate-registration-show");
    refSignup.current.classList.add("animate-registration-hide");
    reference.toggleLogin();
  };

  const handleSignup = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      Name: refName.current.value,
      Username: refUsername.current.value,
      Password: refPassword.current.value,
    });
    axios
      .post("api/users/signup", body, { headers: headers })
      .then((res) => {
        if (res.status === 200) {
          setTimeout(() => {
            backToLogin();
          }, 100);
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div
        ref={refSignup}
        className="absolute bottom-0 top-0 m-auto my-auto flex flex-col rounded-[1rem] bg-white px-[4rem]
        py-[2rem] shadow-[0_0_20px_-5px_#cc9dff] duration-[1s] 
        laptop:h-[48rem] laptop:w-[40rem] laptop:translate-x-[-100rem]
        [&>*:not(:first-child)]:mt-[2rem]"
      >
        <p className="text-center text-3xl font-semibold uppercase">signup</p>

        <div className="flex flex-col gap-[1rem] text-gray-600">
          <p className="font-bold">Name</p>
          <input
            className="rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] focus:outline-none"
            ref={refName}
            type="text"
            placeholder="Type your name"
          />
          <p className="font-bold">Username</p>
          <input
            className="rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] focus:outline-none"
            type="text"
            ref={refUsername}
            placeholder="Type your username"
          />
          <p className="font-bold">Password</p>
          <input
            className="rounded-[.4rem] border-[.1rem] border-gray-300 px-[1rem] py-[1rem] focus:outline-none"
            type="password"
            ref={refPassword}
            placeholder="Type your password"
          />
        </div>

        <div
          className="w-full cursor-pointer self-center rounded-[.4rem] 
              bg-gradient-to-r from-purple-100 to-purple-200 bg-[size:200%] bg-[position:0%_0%] py-[1rem]
              text-center font-medium uppercase shadow-[0_3px_3px_-2px_#e4cbff] 
              transition-all duration-200 
              hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_#e4cbff]"
          onClick={handleSignup}
        >
          sign up
        </div>

        <div
          className="cursor-pointer self-center text-blue-500"
          onClick={backToLogin}
        >
          Back to login
        </div>
      </div>
    </>
  );
};

export default Signup;
