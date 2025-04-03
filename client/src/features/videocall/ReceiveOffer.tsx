import React from "react";
import ImageWithLightBoxAndNoLazy from "../../components/ImageWithLightBoxAndNoLazy";
import { useSignal } from "../../context/SignalContext";

const ReceiveOffer = () => {
  const { targetUser, stopCall, answerCall } = useSignal();

  return (
    <div className="relative flex h-[45rem] w-full items-center justify-center">
      <div
        style={{
          backgroundImage: `url(${
            targetUser?.avatar ?? "src/assets/imagenotfound.jpg"
          })`,
        }}
        className={`absolute h-full w-full bg-[size:cover]
        bg-[position:center_center] bg-no-repeat opacity-50`}
      ></div>

      <div className="absolute top-[20%] flex flex-col items-center gap-[1rem]">
        <ImageWithLightBoxAndNoLazy
          src={targetUser?.avatar}
          className="aspect-square w-[10rem]"
          circle
          onClick={() => {}}
        />
        <p className="text-xl">{targetUser?.name}</p>
      </div>

      <div className="absolute bottom-[10%] flex w-[70%] justify-between">
        <button className="text-red-500" onClick={stopCall}>
          Canc
        </button>
        <button className="text-green-500" onClick={answerCall}>
          Answ
        </button>
      </div>
    </div>
  );
};

export default ReceiveOffer;
