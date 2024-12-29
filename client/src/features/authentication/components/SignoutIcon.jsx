import React from "react";
import signout from "../services/signout";

const SignoutIcon = (props) => {
  console.log("SignoutIcon calling");
  const { className } = props;
  return (
    <div
      onClick={signout}
      className={`${className ?? ""} fa fa-sign-out base-icon-sm`}
    ></div>
  );
};

export default SignoutIcon;
