import axios from "axios";
import React from "react";
import useAuth from "../../hook/useAuth";

const Signout = ({ className }) => {
  const auth = useAuth();

  const logout = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    axios
      .post(
        "api/auth/logout",
        {},
        {
          cancelToken: cancelToken.token,
          headers: headers,
        },
      )
      .then((res) => {
        if (res.status === 200) {
          auth.logout();
        } else throw new Error(res.status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  return (
    <div
      onClick={logout}
      className={`${className ?? ""} flex cursor-pointer items-center`}
    >
      <div className="fa fa-sign-out w-full cursor-pointer font-light leading-8">
        <span className="ml-2">Sign out</span>
      </div>
    </div>
  );
};

export default Signout;
