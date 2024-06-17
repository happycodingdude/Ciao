import React, { useRef, useState } from "react";
import ProfileSection from "../profile-new/ProfileSection";
import SideBar from "../sidebar/SideBar";
import { ChatSection } from "./ChatSection";

export const Home = () => {
  console.log("Home calling");

  const [page, setPage] = useState("chat");

  const refListChat = useRef();
  const refChatbox = useRef();

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
          page={page}
          setPage={setPage}
          showChat={() => setPage("chat")}
          showProfile={() => setPage("profile")}
        />
        {
          {
            chat: (
              <ChatSection refListChat={refListChat} refChatbox={refChatbox} />
            ),
            profile: <ProfileSection />,
          }[page]
        }
      </div>
    </div>
  );
};
