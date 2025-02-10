import { LikeOutlined } from "@ant-design/icons";
import React from "react";

const MessageReaction = (props) => {
  const { message, react, pending } = props;
  return (
    <>
      <div
        className={`absolute bottom-[-1rem] z-10 flex items-center justify-between gap-[.5rem] laptop:h-[2.5rem]      
      ${(message.mine && message.reaction.total) || (!message.mine && !message.reaction.total) ? "" : "flex-row-reverse"}`}
      >
        {/* Total and top retions */}
        {message.reaction.total ? (
          <div
            className={`flex cursor-pointer items-center gap-[.5rem] rounded-[2rem]
            border-[.2rem] border-[var(--main-color)] bg-[var(--sub-color)] px-[.5rem] leading-[2rem]
            `}
          >
            <div className="inline-flex">
              {message.topReactions.map((item) => {
                if (item === "like")
                  return (
                    <div className="aspect-square bg-[url('src/assets/like.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[1.7rem]"></div>
                  );
                if (item === "love")
                  return (
                    <div className="aspect-square bg-[url('src/assets/love.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[1.7rem]"></div>
                  );
                if (item === "care")
                  return (
                    <div className="aspect-square bg-[url('src/assets/care.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[1.7rem]"></div>
                  );
                if (item === "wow")
                  return (
                    <div className="aspect-square bg-[url('src/assets/wow.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[1.7rem]"></div>
                  );
                if (item === "sad")
                  return (
                    <div className="aspect-square bg-[url('src/assets/sad.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[1.7rem]"></div>
                  );
                if (item === "angry")
                  return (
                    <div className="aspect-square bg-[url('src/assets/angry.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat laptop:h-[1.7rem]"></div>
                  );
              })}
            </div>
            <p className="leading-[1rem]">{message.reaction.total}</p>
          </div>
        ) : (
          ""
        )}
        {/* Current reaction */}
        <div className="peer flex aspect-square items-center justify-center laptop:w-[2rem]">
          {
            {
              like: (
                <div
                  className="aspect-square cursor-pointer bg-[url('src/assets/like.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat laptop:h-[1.5rem]"
                  onClick={() => react("like")}
                ></div>
              ),
              love: (
                <div
                  className="aspect-square cursor-pointer bg-[url('src/assets/love.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat laptop:h-[1.5rem]"
                  onClick={() => react("love")}
                ></div>
              ),
              care: (
                <div
                  className="aspect-square cursor-pointer bg-[url('src/assets/care.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat laptop:h-[1.5rem]"
                  onClick={() => react("care")}
                ></div>
              ),
              wow: (
                <div
                  className="aspect-square cursor-pointer bg-[url('src/assets/wow.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat laptop:h-[1.5rem]"
                  onClick={() => react("wow")}
                ></div>
              ),
              sad: (
                <div
                  className="aspect-square cursor-pointer bg-[url('src/assets/sad.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat laptop:h-[1.5rem]"
                  onClick={() => react("sad")}
                ></div>
              ),
              angry: (
                <div
                  className="aspect-square cursor-pointer bg-[url('src/assets/angry.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat laptop:h-[1.5rem]"
                  onClick={() => react("angry")}
                ></div>
              ),
              null: (
                <LikeOutlined
                  className={`flex aspect-square cursor-pointer items-center justify-center rounded-full border-[.15rem] border-[var(--main-color)] 
                  bg-[var(--sub-color)] laptop:h-[2rem]
                  ${pending ? "pointer-events-none opacity-50" : ""}`}
                  style={{ fontSize: "12px" }}
                  onClick={() => react("like")}
                />
              ),
            }[message.reaction.currentReaction]
          }
        </div>
        {/* List reactions */}
        <div
          className={`absolute bottom-[2.2rem] z-10 flex scale-0 items-center justify-evenly rounded-[2rem] border-[.2rem] border-[var(--main-color)] 
          bg-[var(--sub-color)] transition-all duration-200 hover:scale-100 peer-hover:scale-100 laptop:h-[4rem] laptop:w-[20rem]
          ${message.mine ? "origin-bottom-right laptop:right-[.1rem]" : "origin-bottom-left laptop:left-0"}`}
        >
          <div
            className="aspect-square cursor-pointer bg-[url('src/assets/like.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"
            onClick={() => react("like")}
          ></div>
          <div
            className="aspect-square cursor-pointer bg-[url('src/assets/love.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"
            onClick={() => react("love")}
          ></div>
          <div
            className="aspect-square cursor-pointer bg-[url('src/assets/care.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"
            onClick={() => react("care")}
          ></div>
          <div
            className="aspect-square cursor-pointer bg-[url('src/assets/wow.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"
            onClick={() => react("wow")}
          ></div>
          <div
            className="aspect-square cursor-pointer bg-[url('src/assets/sad.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"
            onClick={() => react("sad")}
          ></div>
          <div
            className="aspect-square cursor-pointer bg-[url('src/assets/angry.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all duration-200  hover:scale-125 laptop:h-[2.5rem]"
            onClick={() => react("angry")}
          ></div>
        </div>
      </div>
    </>
  );
};

export default MessageReaction;
