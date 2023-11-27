import React from "react";
import useAuth from "../hook/useAuth";

const Signout = () => {
  const auth = useAuth();

  const logout = () => {
    auth.logout();
  };

  return (
    <div
      onClick={logout}
      className="fa fa-sign-out absolute bottom-[5%] cursor-pointer text-lg font-light text-gray-400"
    >
      &ensp;Sign Out
    </div>
  );
};

export default Signout;
