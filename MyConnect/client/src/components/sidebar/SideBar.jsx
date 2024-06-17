import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useInfo, useLoading, useLocalStorage } from "../../hook/CustomHooks";
// import { notifyMessage, registerConnection } from "../../hook/NotificationAPIs";
import { registerConnection } from "../../hook/NotificationAPIs";
import Authentication from "../authentication/Authentication";
import Signout from "../authentication/Signout";
import ChatIcon from "../chat/ChatIcon";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
// import { requestPermission } from "../common/Notification";
import ProfileIcon from "../profile-new/ProfileIcon";
import Notification from "./Notification";

const SideBar = (props) => {
  console.log("SideBar calling");
  const { page, setPage, showChat, showProfile } = props;

  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");

  const { data: info, isLoading, error } = useInfo();
  const { setLoading } = useLoading();

  if (isLoading) {
    // return;
    setLoading(true);
  } else if (error?.status === 401 && refresh) {
    return <RefreshToken />;
  } else if (!info || (error?.status === 401 && !refresh)) {
    setPage(null);
    return <Authentication />;
  }

  const { mutate: registerConnectionMutation } = useMutation({
    mutationFn: ({ token }) => registerConnection(info.id, token),
  });

  useEffect(() => {
    // requestPermission(registerConnectionMutation, notifyMessage);
  }, [info?.id]);

  setTimeout(() => {
    setLoading(false);
  }, 500);

  return (
    <section className="w-full max-w-[7%] shrink-0 bg-[var(--bg-color)]">
      <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
        <div className="flex w-full flex-col items-center gap-[3rem]">
          <ImageWithLightBoxWithBorderAndShadow
            src={info?.avatar ?? ""}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            slides={[
              {
                src: info?.avatar ?? "",
              },
            ]}
          />
          <ChatIcon show={showChat} focus={page === "chat"} />
          <ProfileIcon show={showProfile} focus={page === "profile"} />
        </div>
        <div className="flex flex-col gap-[3rem]">
          {/* <NotificationProvider> */}
          <Notification />
          {/* </NotificationProvider> */}
          <Signout className="text-xl font-thin" />
        </div>
      </div>
    </section>
  );
};

const RefreshToken = () => {
  console.log("RefreshToken calling");

  const queryClient = useQueryClient();
  const { setLoading } = useLoading();

  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");

  const [process, setProcess] = useState(false);

  const { mutate: refreshMutation, isError } = useMutation({
    mutationFn: async () => {
      return (
        await HttpRequest({
          method: "post",
          url: import.meta.env.VITE_ENDPOINT_REFRESH,
          data: {
            refreshToken: refresh,
          },
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
    setLoading(false);
    return <Authentication />;
  }
};

export default SideBar;
