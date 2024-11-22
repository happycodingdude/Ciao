import { LikeOutlined } from "@ant-design/icons";
import React from "react";

const MessageReaction = (props) => {
  const { like } = props;
  return (
    <>
      <LikeOutlined
        className="peer absolute bottom-[-40%] right-[-5%] cursor-pointer p-[.2rem]"
        style={{ fontSize: "16px" }}
      />
      <div
        className="absolute bottom-[-30%] right-[40%] z-10 flex h-[5rem] w-[27rem] origin-bottom-right scale-100 items-center justify-evenly
      gap-[.5rem] rounded-[2rem] border-[.2rem] border-[var(--main-color)] bg-[var(--sub-color)] transition-all duration-200 hover:scale-100
      peer-hover:scale-100"
      >
        <div className="aspect-square h-[3rem] cursor-pointer bg-[url('images/like.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"></div>
        <div className="aspect-square h-[3rem] cursor-pointer bg-[url('images/love.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"></div>
        <div className="aspect-square h-[3rem] cursor-pointer bg-[url('images/care.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"></div>
        <div className="aspect-square h-[3rem] cursor-pointer bg-[url('images/wow.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"></div>
        <div className="aspect-square h-[3rem] cursor-pointer bg-[url('images/sad.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"></div>
        <div className="aspect-square h-[3rem] cursor-pointer bg-[url('images/angry.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"></div>
      </div>
    </>
  );
};

export default MessageReaction;
