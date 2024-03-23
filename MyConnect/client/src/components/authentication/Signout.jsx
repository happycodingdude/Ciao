import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";

const Signout = ({ className }) => {
  const auth = useAuth();

  const logout = () => {
    HttpRequest({
      method: "post",
      url: "api/auth/logout",
      token: auth.token,
    }).then((res) => {
      auth.logout();
    });
  };

  return (
    <div
      onClick={logout}
      className={`${className ?? ""} flex cursor-pointer items-center text-[var(--danger-text-color)]`}
    >
      <div className="fa fa-sign-out w-full cursor-pointer font-light leading-8">
        <span className="ml-2">Sign out</span>
      </div>
    </div>
  );
};

export default Signout;
