import React, { useState } from "react";
import useInfo from "../features/authentication/hooks/useInfo";
// import ProfileSection from "../features/profile-new/ProfileSection";
// import ChatSection from "../layouts/ChatSection";
import { lazy } from "react";
import { SignalProvider } from "../context/SignalContext";
import useFriend from "../features/friend/hooks/useFriend";
import SideBar from "../layouts/SideBar";

const ChatSection = lazy(() => import("../layouts/ChatSection"));
const ProfileSection = lazy(
  () => import("../features/profile-new/ProfileSection"),
);

const Home = () => {
  // console.log("Home calling");

  // const queryClient = useQueryClient();

  const { data: info } = useInfo();
  useFriend();

  // const isRegistered = useRef<boolean>(false);
  const [page, setPage] = useState<string>("chat");

  // const pc = useRef<RTCPeerConnection | null>(null);

  // Khi load được info -> đăng ký connection để nhận thông báo
  // useEffect(() => {
  //   if (!info) return;
  //   if (!isRegistered.current) {
  //     isRegistered.current = true;
  //     // startConnection(info.id, queryClient, info, pc.current);
  //   }
  // }, [info]);

  // useSignalRegistration(info.id, (remoteStream) => {
  //   console.log(remoteStream);
  // });

  if (!info) return;

  return (
    <SignalProvider userId={info.id}>
      <div
        id="home"
        className="relative w-full text-[var(--text-main-color-light)] phone:text-md tablet:text-base desktop:text-md"
      >
        <div className="home-container ">
          <SideBar page={page} setPage={setPage} />
          {
            {
              chat: <ChatSection />,
              profile: <ProfileSection />,
            }[page]
          }
        </div>
        <div id="portal"></div>
      </div>
    </SignalProvider>
  );
};

export default Home;
