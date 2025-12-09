import { LikeOutlined } from "@ant-design/icons";
import { MessageReactionProps } from "../types";

const MessageReaction = (props: MessageReactionProps) => {
  const { message, react, pending } = props;
  return (
    <>
      <div
        className={`absolute bottom-[-1.5rem] z-10 flex items-center justify-between gap-[.5rem]  
      ${(message.mine && message.reaction.total) || (!message.mine && !message.reaction.total) ? "" : "flex-row-reverse"}`}
      >
        {/* MARK: TOTAL AND TOP REACTIONS */}
        {message.reaction.total ? (
          <div
            className={`flex cursor-pointer items-center gap-[.5rem] rounded-[2rem]
            border-[.2rem] border-[var(--main-color)] bg-[var(--sub-color)] px-[.5rem] py-[.1rem]
            `}
          >
            <div className="inline-flex">
              {message.topReactions.map((item) => {
                if (item === "like")
                  return (
                    <div className="aspect-square h-[1.5rem] bg-[url('/src/assets/like.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat"></div>
                  );
                if (item === "love")
                  return (
                    <div className="aspect-square h-[1.5rem] bg-[url('/src/assets/love.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat"></div>
                  );
                if (item === "care")
                  return (
                    <div className="aspect-square h-[1.5rem] bg-[url('/src/assets/care.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat"></div>
                  );
                if (item === "wow")
                  return (
                    <div className="aspect-square h-[1.5rem] bg-[url('/src/assets/wow.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat"></div>
                  );
                if (item === "sad")
                  return (
                    <div className="aspect-square h-[1.5rem] bg-[url('/src/assets/sad.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat"></div>
                  );
                if (item === "angry")
                  return (
                    <div className="aspect-square h-[1.5rem] bg-[url('/src/assets/angry.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat"></div>
                  );
              })}
            </div>
            <p className="leading-[1.5rem]">{message.reaction.total}</p>
          </div>
        ) : (
          ""
        )}
        {/* MARK: CURRENT REACTION */}
        <div className="peer flex aspect-square w-[2rem] items-center justify-center">
          {
            {
              like: (
                <div
                  className="aspect-square h-[1.5rem] cursor-pointer bg-[url('/src/assets/like.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat"
                  onClick={() => react("like")}
                ></div>
              ),
              love: (
                <div
                  className="aspect-square h-[1.5rem] cursor-pointer bg-[url('/src/assets/love.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat"
                  onClick={() => react("love")}
                ></div>
              ),
              care: (
                <div
                  className="aspect-square h-[1.5rem] cursor-pointer bg-[url('/src/assets/care.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat"
                  onClick={() => react("care")}
                ></div>
              ),
              wow: (
                <div
                  className="aspect-square h-[1.5rem] cursor-pointer bg-[url('/src/assets/wow.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat"
                  onClick={() => react("wow")}
                ></div>
              ),
              sad: (
                <div
                  className="aspect-square h-[1.5rem] cursor-pointer bg-[url('/src/assets/sad.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat"
                  onClick={() => react("sad")}
                ></div>
              ),
              angry: (
                <div
                  className="aspect-square h-[1.5rem] cursor-pointer bg-[url('/src/assets/angry.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat"
                  onClick={() => react("angry")}
                ></div>
              ),
              null: (
                <LikeOutlined
                  className={`flex aspect-square h-[2rem] cursor-pointer items-center justify-center rounded-full border-[.15rem] 
                  border-blue-300 bg-[var(--sub-color)]
                  ${pending ? "pointer-events-none opacity-50" : ""}`}
                  style={{ fontSize: "12px" }}
                  onClick={() => react("like")}
                />
              ),
            }[message.reaction.currentReaction]
          }
        </div>
        {/* MARK: LIST REACTIONS */}
        <div
          className={`absolute bottom-[2.2rem] z-10 flex h-[4rem] w-[20rem] scale-0 items-center justify-evenly rounded-[2rem] 
          border-[.2rem] border-blue-300 bg-[var(--sub-color)] transition-all duration-200 hover:scale-100 peer-hover:scale-100
          ${message.mine ? "right-[.1rem] origin-bottom-right" : "left-0 origin-bottom-left"}`}
        >
          <div
            className="aspect-square h-[2.5rem] cursor-pointer bg-[url('/src/assets/like.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("like")}
          ></div>
          <div
            className="aspect-square h-[2.5rem] cursor-pointer bg-[url('/src/assets/love.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("love")}
          ></div>
          <div
            className="aspect-square h-[2.5rem] cursor-pointer bg-[url('/src/assets/care.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("care")}
          ></div>
          <div
            className="aspect-square h-[2.5rem] cursor-pointer bg-[url('/src/assets/wow.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("wow")}
          ></div>
          <div
            className="aspect-square h-[2.5rem] cursor-pointer bg-[url('/src/assets/sad.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("sad")}
          ></div>
          <div
            className="aspect-square h-[2.5rem] cursor-pointer bg-[url('/src/assets/angry.svg')] bg-[size:80%] bg-[position:center_center] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("angry")}
          ></div>
        </div>
      </div>
    </>
  );
};

export default MessageReaction;
