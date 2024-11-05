import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";
import { HttpRequest } from "../../common/Utility";

// const queryCache = new QueryCache();

const Signout = (props) => {
  console.log("Signout calling");
  const { className } = props;

  const queryClient = useQueryClient();
  // const [token, setToken] = useLocalStorage("token");
  // const [refresh, setRefresh] = useLocalStorage("refresh");
  const navigate = useNavigate();
  // const { setLoading } = useLoading();

  const signout = () => {
    // setLoading(true);
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
    }).then((res) => {
      // refetch();
      // setPage("chat");
      // queryClient.invalidateQueries(["info"]);
      // setTimeout(() => {

      queryClient.removeQueries({ queryKey: ["conversation"], exact: true });
      queryClient.removeQueries({ queryKey: ["message"], exact: true });
      queryClient.removeQueries({ queryKey: ["attachment"], exact: true });
      queryClient.removeQueries({ queryKey: ["notification"], exact: true });
      queryClient.removeQueries({ queryKey: ["info"], exact: true });

      navigate("/auth");

      // }, 1000);
      // queryClient.removeQueries();
      // queryClient.removeQueries({ queryKey: "conversation", exact: true });
      // queryClient.resetQueries({ queryKey: "message", exact: true });
      // queryClient.removeQueries({ queryKey: "participant", exact: true });
      // queryClient.removeQueries({ queryKey: "attachment", exact: true });
      // queryClient.removeQueries({ queryKey: "notification", exact: true });
      // backToLogin();
    });
  };

  return (
    <div
      onClick={signout}
      className={`${className ?? ""} fa fa-sign-out base-icon-sm`}
    >
      {/* <div className="fa fa-sign-out w-full cursor-pointer font-light leading-8"></div> */}
    </div>
  );
};

export default Signout;
