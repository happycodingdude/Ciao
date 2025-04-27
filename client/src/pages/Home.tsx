import { DndContext, DragEndEvent } from "@dnd-kit/core";
import React, { lazy, useEffect, useState } from "react";
import { useSignal } from "../context/SignalContext";
import useInfo from "../features/authentication/hooks/useInfo";
import useFriend from "../features/friend/hooks/useFriend";
import VideoCall, { PositionProps } from "../features/videocall/VideoCall";
import SideBar from "../layouts/SideBar";

const ChatSection = lazy(() => import("../layouts/ChatSection"));
const ProfileSection = lazy(
  () => import("../features/profile-new/ProfileSection"),
);

const Home = () => {
  const { data: info } = useInfo();
  useFriend();

  const [page, setPage] = useState<string>("chat");

  const { targetUser } = useSignal();

  const [position, setPosition] = useState<PositionProps>({ x: 0, y: 0 });
  // Center the modal when it first renders
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 300 - 50,
      y: window.innerHeight - 300 - 50,
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.delta) {
      setPosition((prev) => ({
        x: prev.x + event.delta.x,
        y: prev.y + event.delta.y,
      }));
    }
  };

  if (!info) return;

  return (
    <div
      id="home"
      className="relative w-full text-[var(--text-main-color-light)] phone:text-md tablet:text-base desktop:text-md"
    >
      <div className="home-container">
        <SideBar page={page} setPage={setPage} />
        {
          {
            chat: <ChatSection />,
            profile: <ProfileSection />,
          }[page]
        }
      </div>
      {targetUser !== null ? (
        <DndContext onDragEnd={handleDragEnd}>
          <VideoCall contact={targetUser} position={position} />
        </DndContext>
      ) : (
        ""
      )}
      <div id="portal"></div>
    </div>
  );
};

export default Home;
