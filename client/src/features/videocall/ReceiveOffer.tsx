import { useDraggable } from "@dnd-kit/core";
import React, { CSSProperties } from "react";
import { createPortal } from "react-dom";
import ImageWithLightBoxAndNoLazy from "../../components/ImageWithLightBoxAndNoLazy";
import { useSignal } from "../../context/SignalContext";
import { PositionProps } from "./VideoCall";

type ReceiveOfferProps = {
  position: PositionProps;
};

const ReceiveOffer: React.FC<ReceiveOfferProps> = ({ position }) => {
  const { targetUser, stopCall, answerCall } = useSignal();

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: targetUser.id,
  });
  const style = {
    position: "absolute",
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined, // Keeps movement smooth
  };

  return createPortal(
    <div
      ref={setNodeRef}
      style={style as CSSProperties}
      className="video-call-container phone:h-[30rem] laptop:h-[25rem]"
    >
      <div
        style={{
          backgroundImage: `url(${targetUser?.avatar ?? "src/assets/imagenotfound.jpg"})`,
        }}
        {...listeners}
        {...attributes}
        className={`absolute h-full w-full cursor-grab rounded-[1rem] bg-[size:cover]
            bg-[position:center_center] bg-no-repeat opacity-20`}
      ></div>

      <div className="absolute top-[10%] flex flex-col items-center gap-[1rem]">
        <ImageWithLightBoxAndNoLazy
          src={targetUser?.avatar}
          className="aspect-square w-[10rem]"
          circle
          onClick={() => {}}
        />
        <p className="text-lg text-white">{targetUser?.name}</p>
      </div>

      <div className="pointer-events-auto absolute bottom-[10%] flex w-[70%] justify-between">
        <button className="bg-red-500 text-white" onClick={stopCall}>
          <i className="fa fa-x" />
        </button>

        <button className="bg-green-500 text-white" onClick={answerCall}>
          <i className="fa fa-phone" />
        </button>
      </div>
    </div>,
    document.getElementById("portal"),
  );
};

export default ReceiveOffer;
