import { LikeOutlined } from "@ant-design/icons";
import { MessageReactionProps } from "../types";

const MessageReaction = (props: MessageReactionProps) => {
  const { message, react, pending } = props;
  return (
    <>
      <div
        className={`absolute -bottom-6 z-10 flex items-center justify-between gap-2  
      ${(message.mine && message.reaction.total) || (!message.mine && !message.reaction.total) ? "" : "flex-row-reverse"}`}
      >
        {/* MARK: TOTAL AND TOP REACTIONS */}
        {message.reaction.total ? (
          <div
            className={`rounded-4xl border-(--main-color) bg-(--sub-color) flex cursor-pointer
            items-center gap-2 border-[.2rem] px-2 py-[.1rem]
            `}
          >
            <div className="inline-flex">
              {message.topReactions.map((item) => {
                if (item === "like")
                  return (
                    <div className="bg-size-[80%] bg-position-[center_center] aspect-square h-6 bg-[url('/src/assets/like.svg')] bg-no-repeat"></div>
                  );
                if (item === "love")
                  return (
                    <div className="bg-size-[80%] bg-position-[center_center] aspect-square h-6 bg-[url('/src/assets/love.svg')] bg-no-repeat"></div>
                  );
                if (item === "care")
                  return (
                    <div className="bg-size-[80%] bg-position-[center_center] aspect-square h-6 bg-[url('/src/assets/care.svg')] bg-no-repeat"></div>
                  );
                if (item === "wow")
                  return (
                    <div className="bg-size-[80%] bg-position-[center_center] aspect-square h-6 bg-[url('/src/assets/wow.svg')] bg-no-repeat"></div>
                  );
                if (item === "sad")
                  return (
                    <div className="bg-size-[80%] bg-position-[center_center] aspect-square h-6 bg-[url('/src/assets/sad.svg')] bg-no-repeat"></div>
                  );
                if (item === "angry")
                  return (
                    <div className="bg-size-[80%] bg-position-[center_center] aspect-square h-6 bg-[url('/src/assets/angry.svg')] bg-no-repeat"></div>
                  );
              })}
            </div>
            <p className="leading-6">{message.reaction.total}</p>
          </div>
        ) : (
          ""
        )}
        {/* MARK: CURRENT REACTION */}
        <div className="peer flex aspect-square w-8 items-center justify-center">
          {
            {
              like: (
                <div
                  className="bg-size-[100%] bg-position-[center_center] aspect-square h-6 cursor-pointer bg-[url('/src/assets/like.svg')] bg-no-repeat"
                  onClick={() => react("like")}
                ></div>
              ),
              love: (
                <div
                  className="bg-size-[100%] bg-position-[center_center] aspect-square h-6 cursor-pointer bg-[url('/src/assets/love.svg')] bg-no-repeat"
                  onClick={() => react("love")}
                ></div>
              ),
              care: (
                <div
                  className="bg-size-[100%] bg-position-[center_center] aspect-square h-6 cursor-pointer bg-[url('/src/assets/care.svg')] bg-no-repeat"
                  onClick={() => react("care")}
                ></div>
              ),
              wow: (
                <div
                  className="bg-size-[100%] bg-position-[center_center] aspect-square h-6 cursor-pointer bg-[url('/src/assets/wow.svg')] bg-no-repeat"
                  onClick={() => react("wow")}
                ></div>
              ),
              sad: (
                <div
                  className="bg-size-[100%] bg-position-[center_center] aspect-square h-6 cursor-pointer bg-[url('/src/assets/sad.svg')] bg-no-repeat"
                  onClick={() => react("sad")}
                ></div>
              ),
              angry: (
                <div
                  className="bg-size-[100%] bg-position-[center_center] aspect-square h-6 cursor-pointer bg-[url('/src/assets/angry.svg')] bg-no-repeat"
                  onClick={() => react("angry")}
                ></div>
              ),
              null: (
                <LikeOutlined
                  className={`bg-(--sub-color) flex aspect-square h-8 cursor-pointer items-center justify-center rounded-full 
                  border-[.15rem] border-blue-300
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
          className={`rounded-4xl bg-(--sub-color) absolute bottom-[2.2rem] z-10 flex h-16 w-[20rem] scale-0 items-center 
          justify-evenly border-[.2rem] border-blue-300 transition-all duration-200 hover:scale-100 peer-hover:scale-100
          ${message.mine ? "right-[.1rem] origin-bottom-right" : "left-0 origin-bottom-left"}`}
        >
          <div
            className="bg-size-[80%] bg-position-[center_center] aspect-square h-10 cursor-pointer bg-[url('/src/assets/like.svg')] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("like")}
          ></div>
          <div
            className="bg-size-[80%] bg-position-[center_center] aspect-square h-10 cursor-pointer bg-[url('/src/assets/love.svg')] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("love")}
          ></div>
          <div
            className="bg-size-[80%] bg-position-[center_center] aspect-square h-10 cursor-pointer bg-[url('/src/assets/care.svg')] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("care")}
          ></div>
          <div
            className="bg-size-[80%] bg-position-[center_center] aspect-square h-10 cursor-pointer bg-[url('/src/assets/wow.svg')] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("wow")}
          ></div>
          <div
            className="bg-size-[80%] bg-position-[center_center] aspect-square h-10 cursor-pointer bg-[url('/src/assets/sad.svg')] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("sad")}
          ></div>
          <div
            className="bg-size-[80%] bg-position-[center_center] aspect-square h-10 cursor-pointer bg-[url('/src/assets/angry.svg')] bg-no-repeat transition-all  duration-200 hover:scale-125"
            onClick={() => react("angry")}
          ></div>
        </div>
      </div>
    </>
  );
};

export default MessageReaction;
