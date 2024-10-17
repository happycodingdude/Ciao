import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorBoundary from "antd/es/alert/ErrorBoundary";
import React, { useEffect, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { FriendProvider } from "../../context/FriendContext";
import { useLoading, useLocalStorage } from "../../hook/CustomHooks";
import Authentication from "../authentication/Authentication";
import { Home } from "./Home";

// const HomeContainer = () => {
//   console.log("HomeContainer calling");
//   const [refresh, setRefresh] = useLocalStorage("refresh");

//   const { data: info, isLoading, error, isRefetching } = useInfo();
//   const { setLoading } = useLoading();

//   if (isLoading || isRefetching) {
//     setLoading(true);
//     return;
//   } else if (error?.status === 401 && refresh) {
//     return <RefreshToken />;
//   } else if (!info || (error?.status === 401 && !refresh)) {
//     setLoading(false);
//     return <Authentication />;
//   }

//   setLoading(false);
//   return (
//     <ErrorBoundary>
//       <FriendProvider>
//         <Home></Home>
//       </FriendProvider>
//     </ErrorBoundary>
//   );
// };

const HomeContainer = () => {
  console.log("HomeContainer calling");
  // const [refresh, setRefresh] = useLocalStorage("refresh");

  // const { data: info, isLoading, error, isRefetching } = useInfo();
  // const { setLoading } = useLoading();

  // if (isLoading || isRefetching) {
  //   setLoading(true);
  //   return;
  // } else if (error?.status === 401 && refresh) {
  //   return <RefreshToken />;
  // } else if (!info || (error?.status === 401 && !refresh)) {
  //   setLoading(false);
  //   return <Authentication />;
  // }

  // setLoading(false);
  return (
    <ErrorBoundary>
      <FriendProvider>
        <Home></Home>
      </FriendProvider>
    </ErrorBoundary>
  );
};

// const RefreshToken = () => {
//   console.log("RefreshToken calling");

//   const queryClient = useQueryClient();
//   const { setLoading } = useLoading();

//   const [token, setToken] = useLocalStorage("token");
//   const [refresh, setRefresh] = useLocalStorage("refresh");

//   const [process, setProcess] = useState(false);

//   const { mutate: refreshMutation, isError } = useMutation({
//     mutationFn: async () => {
//       return (
//         await HttpRequest({
//           method: "post",
//           url: import.meta.env.VITE_ENDPOINT_REFRESH,
//           data: {
//             refreshToken: refresh,
//           },
//         })
//       ).data;
//     },
//     onSuccess: (res) => {
//       // setProcess(false);
//       setToken(res.accessToken);
//       setRefresh(res.refreshToken);
//       setTimeout(() => {
//         queryClient.invalidateQueries(["info"]);
//       }, 500);
//     },
//   });
//   // useEffect(() => {
//   //   if (!process) {
//   //     setProcess(true);
//   //     refreshMutation();
//   //   }
//   // }, [process]);
//   useEffect(() => {
//     refreshMutation();
//   }, []);

//   if (isError) {
//     setLoading(false);
//     return <Authentication />;
//   }
// };

export default HomeContainer;
