import React from "react";
import { useSignal } from "../../context/SignalContext";

const ReceiveOffer = () => {
  const { targetUser, answerCall } = useSignal();

  return (
    // <div className="flex gap-[1rem]">
    //   Receive call from user {targetUser.name}
    //   <button className="text-blue-500" onClick={answerCall}>
    //     Answer
    //   </button>
    // </div>
    <div
      className={`relative h-[40rem] w-full 
    bg-[image:url(${targetUser?.avatar ?? "src/assets/imagenotfound.jpg"})] bg-[size:cover] bg-[position:center_center] bg-no-repeat`}
    ></div>
  );
};

export default ReceiveOffer;
