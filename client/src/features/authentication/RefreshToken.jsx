import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useLoading, useLocalStorage } from "../../hook/CustomHooks";
import Authentication from "./Authentication";

const RefreshToken = () => {
  console.log("RefreshToken calling");

  const queryClient = useQueryClient();
  const { setLoading } = useLoading();

  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");

  const [process, setProcess] = useState(false);

  const {
    mutate: refreshMutation,
    isError,
    error,
  } = useMutation({
    mutationFn: async () => {
      return (
        await HttpRequest({
          method: "post",
          url: import.meta.env.VITE_ENDPOINT_REFRESH,
          data: {
            refreshToken: localStorage.getItem("refresh"),
          },
          timeout: 1000,
        })
      ).data;
    },
    onSuccess: (res) => {
      // setProcess(false);
      setToken(res.accessToken);
      setRefresh(res.refreshToken);
      setTimeout(() => {
        queryClient.invalidateQueries(["info"]);
      }, 500);
    },
  });
  // useEffect(() => {
  //   if (!process) {
  //     setProcess(true);
  //     refreshMutation();
  //   }
  // }, [process]);
  useEffect(() => {
    refreshMutation();
  }, []);

  if (isError) {
    console.log(error);
    setLoading(false);
    return <Authentication />;
  }
};

export default RefreshToken;
