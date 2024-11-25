import { LikeOutlined } from "@ant-design/icons";
import React from "react";

const MessageReaction = (props) => {
  const { message } = props;
  return (
    <>
      <div
        className={`absolute bottom-[-2.5rem] flex justify-between laptop:w-[11rem]
      ${message.mine ? "laptop:left-[-6.5rem]" : ""}
      ${(message.mine && message.totalReaction) || (!message.mine && !message.totalReaction) ? "" : "flex-row-reverse "}`}
      >
        {message.totalReaction ? (
          <div
            className={` flex cursor-pointer items-center justify-evenly rounded-[2rem]
            border-[.2rem] border-[var(--main-color)] bg-[var(--sub-color)] leading-[2rem] laptop:w-[8.5rem]
            `}
          >
            <div className="inline-flex">
              {message.reactions.map((item) => {
                if (item === "like")
                  return (
                    <div className="aspect-square bg-[url('images/like.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[2rem]"></div>
                  );
                if (item === "love")
                  return (
                    <div className="aspect-square bg-[url('images/love.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[2rem]"></div>
                  );
                if (item === "care")
                  return (
                    <div className="aspect-square bg-[url('images/care.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[2rem]"></div>
                  );
                if (item === "wow")
                  return (
                    <div className="aspect-square bg-[url('images/wow.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[2rem]"></div>
                  );
                if (item === "sad")
                  return (
                    <div className="aspect-square bg-[url('images/sad.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[2rem]"></div>
                  );
                if (item === "angry")
                  return (
                    <div className="aspect-square bg-[url('images/angry.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[2rem]"></div>
                  );
              })}
            </div>
            {message.totalReaction}
          </div>
        ) : (
          ""
        )}
        <LikeOutlined
          className={`peer cursor-pointer`}
          style={{ fontSize: "16px" }}
        />
        <div
          className={`absolute bottom-[2.5rem] z-10 flex scale-100 items-center justify-evenly rounded-[2rem] border-[.2rem] border-[var(--main-color)] 
          bg-[var(--sub-color)] transition-all duration-200 hover:scale-100 peer-hover:scale-100 laptop:h-[4rem] laptop:w-[20rem]
          ${message.mine ? "origin-bottom-right laptop:right-[-.1rem]" : "origin-bottom-left laptop:left-0"}`}
        >
          <div className="aspect-square cursor-pointer bg-[url('images/like.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"></div>
          <div className="aspect-square cursor-pointer bg-[url('images/love.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"></div>
          <div className="aspect-square cursor-pointer bg-[url('images/care.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"></div>
          <div className="aspect-square cursor-pointer bg-[url('images/wow.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"></div>
          <div className="aspect-square cursor-pointer bg-[url('images/sad.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"></div>
          <div className="aspect-square cursor-pointer bg-[url('images/angry.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"></div>
        </div>
      </div>
    </>
  );
};

export default MessageReaction;
