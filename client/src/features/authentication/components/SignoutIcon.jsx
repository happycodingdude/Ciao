import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";
import signout from "../services/signout";

const SignoutIcon = (props) => {
  console.log("SignoutIcon calling");
  const { className } = props;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (
    <div
      onClick={() => signout(queryClient, navigate)}
      className={`${className ?? ""} fa fa-sign-out base-icon-sm text-red-500`}
    ></div>
  );
};

export default SignoutIcon;
