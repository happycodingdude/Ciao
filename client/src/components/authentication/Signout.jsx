import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";
import { HttpRequest } from "../../common/Utility";

const Signout = (props) => {
  console.log("Signout calling");
  const { className } = props;

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signout = () => {
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
    }).then((res) => {
      queryClient.removeQueries({ queryKey: ["conversation"], exact: true });
      queryClient.removeQueries({ queryKey: ["message"], exact: true });
      queryClient.removeQueries({ queryKey: ["attachment"], exact: true });
      queryClient.removeQueries({ queryKey: ["notification"], exact: true });
      queryClient.removeQueries({ queryKey: ["info"], exact: true });

      navigate("/auth", { state: { signedOut: true } });
    });
  };

  return (
    <div
      onClick={signout}
      className={`${className ?? ""} fa fa-sign-out base-icon-sm`}
    ></div>
  );
};

export default Signout;
