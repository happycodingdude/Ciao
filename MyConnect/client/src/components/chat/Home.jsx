import { useMutation } from "@tanstack/react-query";
import ErrorBoundary from "antd/es/alert/ErrorBoundary";
import React, { useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { FriendProvider } from "../../context/FriendContext";
import { ProfileProvider } from "../../context/ProfileContext";
import {
  useFetchConversations,
  useFetchFriends,
  useFetchNotifications,
  useFetchParticipants,
  useInfo,
} from "../../hook/CustomHooks";
import Authentication from "../authentication/Authentication";
import ProfileSection from "../profile-new/ProfileSection";
import SideBar from "../sidebar/SideBar";
import { ChatSection } from "./ChatSection";

export const HomeContainer = () => {
  console.log("HomeContainer calling");
  // const queryClient = useQueryClient();

  // const [token, setToken] = useLocalStorage("token");
  // const [refresh, setRefresh] = useLocalStorage("refresh");

  const { data: info, isLoading, error } = useInfo();
  // const { setLoading } = useLoading();

  // const refetch = (newToken, newRefresh) => {
  //   setToken(newToken);
  //   setRefresh(newRefresh);
  //   if (newToken) {
  //     setTimeout(() => {
  //       queryClient.invalidateQueries(["info"]);
  //     }, 500);
  //   }
  // };

  // const [refreshInProcess, setRefreshInProcess] = useState(false);
  // const { mutate: refreshToken } = useMutation({
  //   mutationFn: async () => {
  //     return (
  //       await HttpRequest({
  //         method: "post",
  //         url: import.meta.env.VITE_ENDPOINT_REFRESH,
  //         data: {
  //           refreshToken: refresh,
  //         },
  //       })
  //     ).data;
  //   },
  //   onSuccess: (res) => {
  //     setRefreshInProcess(false);
  //     refetch(res.accessToken, res.refreshToken);
  //   },
  // });

  if (isLoading) {
    // setLoading(true);
    return;
    // } else if (error?.status === 401 && !refreshInProcess) {
    //   setRefreshInProcess(true);
    //   refreshToken();
    //   return;
  }
  // else if (error?.status === 401) {
  //   // RefreshToken(refresh, refetch)
  //   // return "Unauthenticated...";
  //   // return <RefreshToken token={refresh} refetch={refetch} />;
  //   return <Authentication refetch={refetch} />;
  // }
  else if (!info) {
    // setLoading(false);
    return <Authentication />;
  } else {
    // setLoading(false);
  }

  return (
    <ErrorBoundary>
      <FriendProvider>
        <Home></Home>
      </FriendProvider>
    </ErrorBoundary>
  );
};

const RefreshToken = (props) => {
  console.log("RefreshToken calling");
  const { token, refetch } = props;
  const { mutate: refresh } = useMutation({
    mutationFn: async () => {
      return (
        await HttpRequest({
          method: "post",
          url: import.meta.env.VITE_ENDPOINT_REFRESH,
          data: {
            refreshToken: token,
          },
        })
      ).data;
    },
    onSuccess: (res) => {
      refetch(res.accessToken, res.refreshToken);
    },
  });
  useEffect(() => {
    refresh();
  }, [token]);
};

export const Home = () => {
  const [page, setPage] = useState("chat");

  // const auth = useAuth();
  const { reFetch: reFetchConversations } = useFetchConversations();
  const { reFetch: reFetchParticipants } = useFetchParticipants();
  const { reFetchRequest, reFetchRequestById, reFetchFriends } =
    useFetchFriends();
  const { reFetchNotifications } = useFetchNotifications();

  const refListChat = useRef();
  const refChatbox = useRef();

  const notifyMessage = (message) => {
    console.log(message);
    const messageData =
      message.data === undefined ? undefined : JSON.parse(message.data);
    switch (message.event) {
      case "NewMessage":
        refListChat.newMessage(messageData);
        if (refChatbox.newMessage) refChatbox.newMessage(messageData);
        break;
      case "AddMember":
        const listChat = Array.from(document.querySelectorAll(".chat-item"));
        const oldChat = listChat.find(
          (item) => item.dataset.key === messageData.Id,
        );
        // Old chat and is focused
        if (oldChat && oldChat.classList.contains("item-active"))
          reFetchParticipants(messageData.Id);
        else reFetchConversations();
        break;
      case "NewConversation":
        reFetchConversations();
        break;
      case "NewFriendRequest":
        reFetchRequestById(messageData.RequestId);
        break;
      case "AcceptFriendRequest":
        reFetchRequestById(messageData.RequestId);
        reFetchFriends();
        break;
      case "CancelFriendRequest":
        reFetchRequest(messageData.ContactId);
        break;
      case "NewNotification":
        reFetchNotifications();
        break;
      default:
        break;
    }
  };

  // const registerConnection = (token) => {
  //   HttpRequest({
  //     method: "post",
  //     url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_REGISTER,
  //     token: auth.token,
  //     // controller: controller,
  //     data: {
  //       Id: auth.id,
  //       Token: token,
  //     },
  //   });
  // };

  // useEffect(() => {
  //   if (!auth.valid) return;

  //   reFetchFriends();
  //   requestPermission(registerConnection, notifyMessage);

  //   // listenNotification((message) => {
  //   //   console.log("Home receive message from worker");
  //   //   const messageData = JSON.parse(message.data);
  //   //   switch (message.event) {
  //   //     case "AddMember":
  //   //       console.log(messageData);
  //   //       break;
  //   //     default:
  //   //       break;
  //   //   }
  //   // });
  //   // return () => {
  //   //   controller.abort();
  //   // };
  // }, [auth.valid]);

  return (
    <div
      id="home"
      className="relative w-full text-[clamp(1.5rem,1.2vw,2.5rem)]"
    >
      <div className="home-container absolute flex h-full w-full bg-gradient-to-r from-[var(--main-color-thin)] to-blue-100">
        <SideBar
          showChat={() => setPage("chat")}
          showProfile={() => setPage("profile")}
        />
        {
          {
            chat: (
              <ChatSection refListChat={refListChat} refChatbox={refChatbox} />
            ),
            profile: (
              <ProfileProvider>
                <ProfileSection />
              </ProfileProvider>
            ),
          }[page]
        }
      </div>
    </div>
  );
};
