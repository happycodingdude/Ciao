import axios from "axios";
import React from "react";
import useAuth from "../../hook/useAuth";

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
        "api/users/logout",
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
    // <div
    //   onClick={logout}
    //   className="fa fa-sign-out cursor-pointer font-light text-gray-400 hover:bg-[#f0f0f0]"
    // >
    //   &ensp;Sign out
    // </div>

    <div onClick={logout} className="flex items-center hover:bg-[#f0f0f0]">
      <div className="fa fa-sign-out w-[2rem] cursor-pointer font-light text-gray-400"></div>
      <p className="">Sign out</p>
    </div>
  );
};

export default Signout;
