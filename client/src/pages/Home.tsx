import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useSignal } from "../context/SignalContext";
import useInfo from "../features/authentication/hooks/useInfo";
import VideoCall, { PositionProps } from "../features/videocall/VideoCall";
import "../home.css";

const Home = () => {
  console.log("Rendering HomeComponent");
  const { data: info } = useInfo();
  // useFriend();

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
      className="text-(--text-main-color-light) relative h-full w-full"
    >
      {targetUser !== null ? (
        <DndContext onDragEnd={handleDragEnd}>
          <VideoCall contact={targetUser} position={position} />
        </DndContext>
      ) : (
        ""
      )}
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
        Welcome to home page
      </p>
      <div id="portal"></div>
    </div>
  );
};

export default Home;
