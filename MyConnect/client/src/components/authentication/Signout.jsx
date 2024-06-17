import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useLoading, useLocalStorage } from "../../hook/CustomHooks";

const Signout = ({ className }) => {
  console.log("Signout calling");

  const queryClient = useQueryClient();
  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");
  const { setLoading } = useLoading();

  // const { mutate: signoutMutation, isSuccess } = useMutation({
  //   mutationFn: signout,
  // });

  // if (isSuccess) return <Authentication />;

  const signout = () => {
    setLoading(true);
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
      token: token,
    }).then((res) => {
      setToken(null);
      setRefresh(null);
      setTimeout(() => {
        queryClient.invalidateQueries(["info"]);
      }, 200);
    });
  };

  return (
    <div
      onClick={signout}
      className={`${className ?? ""} flex cursor-pointer items-center`}
    >
      <div className="fa fa-sign-out w-full cursor-pointer font-light leading-8"></div>
    </div>
  );
};

export default Signout;
