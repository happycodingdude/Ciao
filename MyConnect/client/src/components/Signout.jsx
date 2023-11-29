import axios from "axios";
import React from "react";
import useAuth from "../hook/useAuth";

const Signout = () => {
  const auth = useAuth();

  const logout = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    axios
      .post(
        "api/user/logout",
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
      className="fa fa-sign-out absolute bottom-[5%] left-[2%] cursor-pointer text-lg font-light text-gray-400"
    >
      &ensp;Sign Out
    </div>
  );
};

export default Signout;
