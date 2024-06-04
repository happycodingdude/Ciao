import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";

const Signout = ({ className }) => {
  const auth = useAuth();

  const logout = () => {
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
      token: auth.token,
    }).then((res) => {
      auth.logout();
    });
  };

  return (
    <div
      onClick={logout}
      className={`${className ?? ""} flex cursor-pointer items-center`}
    >
      <div className="fa fa-sign-out w-full cursor-pointer font-light leading-8">
      </div>
    </div>
  );
};

export default Signout;
