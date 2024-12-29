import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "../../common/CustomButton";
import CustomInput from "../../common/CustomInput";
import ErrorComponent from "../../common/ErrorComponent";
import signup from "../services/signup";

const SignupForm = (props) => {
  const { show, onSuccess } = props;
  console.log("Signup calling");

  const [processing, setProcessing] = useState(false);

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
    if (!show) reset();
  }, [show]);

  const { mutate: signupMutation } = useMutation({
    mutationFn: ({ name, username, password }) =>
      signup(name, username, password),
    onSuccess: (res) => {
      setProcessing(false);
      onSuccess();
    },
    onError: (error) => {
      setProcessing(false);
      setError(error.response.data);
    },
  });

  const signupCTA = () => {
    if (refUsername.current.value === "" || refPassword.current.value === "")
      return;

    setProcessing(true);
    signupMutation({
      name: refName.current.value,
      username: refUsername.current.value,
      password: refPassword.current.value,
    });
  };

  return (
    <div className="flex flex-col gap-[3rem]">
      {/* <div className="flex flex-col gap-[3rem]"> */}
      <CustomInput
        tabIndex={show ? "1" : "-1"}
        reference={refName}
        type="text"
        label="Name"
      />
      <CustomInput
        tabIndex={show ? "2" : "-1"}
        reference={refUsername}
        type="text"
        label="Username"
      />
      <div className="relative">
        <CustomInput
          tabIndex={show ? "3" : "-1"}
          reference={refPassword}
          className="pr-20"
          type={showPassword ? "text" : "password"}
          label="Password"
        />
        <div
          onClick={() => setShowPassword(!showPassword)}
          className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center 
              hover:text-[var(--main-color-light)] ${showPassword ? "fa-eye text-[var(--main-color)]" : "fa-eye-slash text-[var(--main-color)]"}`}
        ></div>
      </div>
      <ErrorComponent error={error} />
      <CustomButton
        processing={processing}
        title="Sign up"
        onClick={signupCTA}
      />
    </div>
  );
};

export default SignupForm;
