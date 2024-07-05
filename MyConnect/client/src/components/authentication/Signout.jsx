import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useInfo, useLocalStorage } from "../../hook/CustomHooks";

const Signout = (props) => {
  console.log("Signout calling");
  const { className, setPage } = props;

  // const queryClient = useQueryClient();
  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");
  const { refetch } = useInfo();
  // const { setLoading } = useLoading();

  const signout = () => {
    // setLoading(true);
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
      token: token,
    }).then((res) => {
      setRefresh(null);
      setToken(null);
      refetch();
      // setPage("chat");
      // queryClient.invalidateQueries(["info"]);
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
