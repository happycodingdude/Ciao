import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useLoading } from "../../hook/CustomHooks";
import { signup } from "../../hook/UserAPIs";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ErrorComponent from "../common/ErrorComponent";

const Signup = (props) => {
  const { show, onSuccess } = props;
  console.log("Signup calling");

  const { setLoading } = useLoading();

  const refSignup = useRef();
  const refName = useRef();
  const refUsername = useRef();
  const refPassword = useRef();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setError("");
    refName.current.reset();
    refUsername.current.reset();
    refPassword.current.reset();
  };

  useEffect(() => {
    // Khi toggle ẩn signup thì clear các value đã nhập
    if (show) reset();
  }, [show]);

  const { mutate: signupMutation } = useMutation({
    mutationFn: ({ name, username, password }) =>
      signup(name, username, password),
    onSuccess: (res) => {
      setLoading(false);
      onSuccess();
    },
    onError: (error) => {
      setLoading(false);
      let msg = "";
      error.data.errors.map((message) => {
        msg += `${message.description} </br>`;
      });
      console.log(msg);
      setError(msg);
    },
  });

  const signupCTA = () => {
    if (refUsername.current.value === "" || refPassword.current.value === "")
      return;

    setLoading(true);

    // setTimeout(() => {
    //   setLoading(false);
    //   onSuccess();
    // }, 2000);
    signupMutation({
      name: refName.current.value,
      username: refUsername.current.value,
      password: refPassword.current.value,
    });
  };

  return (
    <div
      ref={refSignup}
      data-state={show}
      className="absolute left-0 h-full w-[40%] bg-[var(--bg-color)] transition-all duration-500
      data-[state=false]:translate-x-[-700%] data-[state=true]:translate-x-0"
    >
      <div className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] bg-[var(--bg-color)]">
        <p className="text-5xl">Create account</p>

        <div className="flex flex-col gap-[3rem]">
          {/* <div className="flex flex-col gap-[3rem]"> */}
          <CustomInput reference={refName} type="text" label="Name" />
          <CustomInput reference={refUsername} type="text" label="Username" />
          <div className="relative">
            <CustomInput
              reference={refPassword}
              className="pr-20"
              type={showPassword ? "text" : "password"}
              label="Password"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center 
              hover:text-[var(--main-color-bold)] ${showPassword ? "fa-eye text-[var(--main-color)]" : "fa-eye-slash text-[var(--main-color)]"}`}
            ></div>
          </div>
          <ErrorComponent error={error} />
          {/* </div> */}
          <CustomButton title="Sign up" onClick={signupCTA} />
        </div>
      </div>
    </div>
  );
};

export default Signup;
