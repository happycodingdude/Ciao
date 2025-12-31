import { LikeOutlined } from "@ant-design/icons";
import "../chatbox.css";
import { MessageReactionProps } from "../types";

const MessageReaction = (props: MessageReactionProps) => {
  const { message, react, pending } = props;
  return (
    <>
      <div
        className={`absolute -bottom-5 z-10 flex items-center justify-between gap-2  
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
                    <div className="top-reaction bg-[url('/src/assets/like.svg')]"></div>
                  );
                if (item === "love")
                  return (
                    <div className="top-reaction bg-[url('/src/assets/love.svg')]"></div>
                  );
                if (item === "care")
                  return (
                    <div className="top-reaction bg-[url('/src/assets/care.svg')]"></div>
                  );
                if (item === "wow")
                  return (
                    <div className="top-reaction bg-[url('/src/assets/wow.svg')]"></div>
                  );
                if (item === "sad")
                  return (
                    <div className="top-reaction bg-[url('/src/assets/sad.svg')]"></div>
                  );
                if (item === "angry")
                  return (
                    <div className="top-reaction bg-[url('/src/assets/angry.svg')]"></div>
                  );
              })}
            </div>
            <p className="leading-6">{message.reaction.total}</p>
          </div>
        ) : (
          ""
        )}
        {/* MARK: CURRENT REACTION */}
        <div className="current-reaction-container peer">
          {
            {
              like: (
                <div
                  className="current-reaction-item bg-[url('/src/assets/like.svg')] "
                  onClick={() => react("like")}
                ></div>
              ),
              love: (
                <div
                  className="current-reaction-item bg-[url('/src/assets/love.svg')] "
                  onClick={() => react("love")}
                ></div>
              ),
              care: (
                <div
                  className="current-reaction-item bg-[url('/src/assets/care.svg')] "
                  onClick={() => react("care")}
                ></div>
              ),
              wow: (
                <div
                  className="current-reaction-item bg-[url('/src/assets/wow.svg')] "
                  onClick={() => react("wow")}
                ></div>
              ),
              sad: (
                <div
                  className="current-reaction-item bg-[url('/src/assets/sad.svg')] "
                  onClick={() => react("sad")}
                ></div>
              ),
              angry: (
                <div
                  className="current-reaction-item bg-[url('/src/assets/angry.svg')] "
                  onClick={() => react("angry")}
                ></div>
              ),
              null: (
                <LikeOutlined
                  className={`bg-(--sub-color) flex! aspect-square h-6 cursor-pointer items-center justify-center rounded-full 
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
          className={`list-reaction-container
          ${message.mine ? "right-6 origin-bottom-right" : "left-6 origin-bottom-left"}`}
        >
          <div
            className="reaction-item bg-[url('/src/assets/like.svg')] "
            onClick={() => react("like")}
          ></div>
          <div
            className="reaction-item bg-[url('/src/assets/love.svg')] "
            onClick={() => react("love")}
          ></div>
          <div
            className="reaction-item bg-[url('/src/assets/care.svg')] "
            onClick={() => react("care")}
          ></div>
          <div
            className="reaction-item bg-[url('/src/assets/wow.svg')] "
            onClick={() => react("wow")}
          ></div>
          <div
            className="reaction-item bg-[url('/src/assets/sad.svg')] "
            onClick={() => react("sad")}
          ></div>
          <div
            className="reaction-item bg-[url('/src/assets/angry.svg')] "
            onClick={() => react("angry")}
          ></div>
        </div>
      </div>
    </>
  );
};

export default MessageReaction;
