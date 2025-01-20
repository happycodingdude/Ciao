import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MessageReaction from "../../../components/MessageReaction";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import reactMessage from "../services/reactMessage";

const MessageContent = (props) => {
  // console.log("MessageContent calling");
  const { message, id, pending, mt, innerRef, height, style } = props;

  if (!message) return null;

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const [reaction, setReaction] = useState(() => {
    return {
      likeCount: message.likeCount,
      loveCount: message.loveCount,
      careCount: message.careCount,
      wowCount: message.wowCount,
      sadCount: message.sadCount,
      angryCount: message.angryCount,
      total:
        message.likeCount +
        message.loveCount +
        message.careCount +
        message.wowCount +
        message.sadCount +
        message.angryCount,
      currentReaction: message.currentReaction,
    };
  });

  useEffect(() => {
    setReaction((current) => {
      return {
        ...current,
        likeCount: message.likeCount,
        loveCount: message.loveCount,
        careCount: message.careCount,
        wowCount: message.wowCount,
        sadCount: message.sadCount,
        angryCount: message.angryCount,
        total:
          message.likeCount +
          message.loveCount +
          message.careCount +
          message.wowCount +
          message.sadCount +
          message.angryCount,
        currentReaction: message.currentReaction,
      };
    });
  }, [message]);

  const generateMostReaction = useCallback(() => {
    const reactions = {
      like: reaction.likeCount,
      love: reaction.loveCount,
      care: reaction.careCount,
      wow: reaction.wowCount,
      sad: reaction.sadCount,
      angry: reaction.angryCount,
    };

    return Object.entries(reactions)
      .filter(([_, count]) => count > 0) // Exclude zero counts
      .sort((a, b) => b[1] - a[1]) // Sort by count
      .slice(0, 3) // Get the top 3
      .map(([key]) => key); // Extract reaction names
  }, [reaction]);

  const [topReactions, setTopReactions] = useState(() =>
    generateMostReaction(),
  );

  useEffect(() => {
    setTopReactions(generateMostReaction());
  }, [reaction]);

  const react = (type) => {
    console.log(`reaction type => ${type}...`);
    const desc = reaction.currentReaction === type;
    reactMessage(id, message.id, type, desc);
    setReaction((current) => {
      const reactionKeys = {
        like: "likeCount",
        love: "loveCount",
        care: "careCount",
        wow: "wowCount",
        sad: "sadCount",
        angry: "angryCount",
      };

      const previousReaction = current.currentReaction;
      const previousKey = reactionKeys[previousReaction];
      const newKey = reactionKeys[type];

      return {
        ...current,
        total:
          previousReaction && !desc
            ? current.total
            : desc
              ? current.total - 1
              : current.total + 1,
        currentReaction: desc ? null : type,
        ...(previousKey && {
          [previousKey]: current[previousKey] - 1,
        }),
        ...(newKey &&
          !desc && {
            [newKey]: (current[newKey] || 0) + 1,
          }),
      };
    });
  };

  return (
    <div
      ref={innerRef}
      data-id={message.id}
      key={message.id}
      className={`flex shrink-0 gap-[1rem] ${message.contactId === info.id ? "flex-row-reverse" : ""} ${mt ? "mt-auto" : ""}`}
      style={style}
      // style={{ height: `${height}px` }}
    >
      {/* Sender avatar */}
      {message.contactId !== info.id ? (
        <div className="relative w-[3rem] self-start">
          <ImageWithLightBoxAndNoLazy
            src={
              conversations.selected?.participants.find(
                (q) => q.contact.id === message.contactId,
              )?.contact.avatar
            }
            className="loaded aspect-square w-full cursor-pointer rounded-[50%] !bg-[size:160%]"
            slides={[
              {
                src: conversations.selected?.participants.find(
                  (q) => q.contact.id === message.contactId,
                )?.contact.avatar,
              },
            ]}
          />
        </div>
      ) : (
        ""
      )}
      <div
        className={`relative flex flex-col laptop:w-[clamp(60rem,70%,80rem)] desktop:w-[clamp(40rem,70%,80rem)] ${message.contactId === info.id ? "items-end" : "items-start"}`}
      >
        {/* Sender infor */}
        <div
          className={`flex items-center gap-[1rem] text-xs text-[var(--text-main-color-thin)] ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
        >
          {message.contactId === info.id ? (
            ""
          ) : (
            <p className="">
              {
                conversations.selected?.participants.find(
                  (q) => q.contact.id === message.contactId,
                )?.contact.name
              }
            </p>
          )}

          <p>
            {moment(message.createdTime).format("DD/MM/YYYY") ===
            moment().format("DD/MM/YYYY")
              ? moment(message.createdTime).format("HH:mm")
              : moment(message.createdTime).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
        {/* Content */}
        {message.content ? (
          <div
            // className={` break-all rounded-[1rem] ${pending ? "opacity-50" : ""} my-[.5rem] px-[1rem] leading-[5rem]
            // ${
            //   message.contactId === info.id
            //     ? "rounded-tr-none bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] text-[var(--text-sub-color)]"
            //     : "rounded-tl-none bg-[var(--bg-color-extrathin)] text-[var(--text-main-color)]"
            // }`}
            className={`cursor-pointer break-all rounded-[2rem] ${message.pending ? "opacity-50" : ""} my-[.5rem] px-[1.6rem] leading-[3rem]
            ${
              message.contactId === info.id
                ? "bg-[var(--main-color)]"
                : "bg-[var(--bg-color-light)]"
            }`}
          >
            {message.content}
          </div>
        ) : (
          ""
        )}

        {message.attachments && message.attachments.length !== 0 ? (
          <div
            className={`flex w-full flex-wrap ${message.contactId === info.id ? "justify-end" : ""} gap-[1rem]`}
          >
            {message.attachments.map((item, index) => {
              // return message.noLazy ? (
              //   <ImageWithLightBoxAndNoLazy
              //     src={item.mediaUrl}
              //     title={item.mediaName?.split(".")[0]}
              //     className={`aspect-[3/2] cursor-pointer !bg-[size:110%]
              //       ${message.loaded ? "loaded" : ""}
              //       ${message.attachments?.length === 1 ? "!w-[70%]" : "!w-[30%]"}`}
              //     slides={message.attachments.map((item) => ({
              //       src: item.type === "image" ? item.mediaUrl : "",
              //     }))}
              //     index={index}
              //   />
              // ) : (
              //   <ImageWithLightBox
              //     src={item.mediaUrl}
              //     title={item.mediaName?.split(".")[0]}
              //     className={`aspect-[3/2] ${message.attachments?.length === 1 ? "!w-[70%]" : "!w-[30%]"} cursor-pointer`}
              //     slides={message.attachments.map((item) => ({
              //       src: item.type === "image" ? item.mediaUrl : "",
              //     }))}
              //     index={index}
              //     imageClassName="!bg-[size:100%]"
              //   />
              // );

              return (
                <ImageWithLightBoxAndNoLazy
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  className={`loaded aspect-[3/2] cursor-pointer !bg-[size:110%]                      
                      ${message.attachments?.length === 1 ? "!w-[70%]" : "!w-[30%]"}`}
                  slides={message.attachments.map((item) => ({
                    src: item.type === "image" ? item.mediaUrl : "",
                  }))}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          ""
        )}
        <MessageReaction
          message={{
            mine: message.contactId === info.id,
            reaction: reaction,
            topReactions: topReactions,
          }}
          react={react}
          pending={pending}
        />
        {/* {!pending ? (
          <MessageReaction
            message={{
              mine: message.contactId === info.id,
              reaction: reaction,
              topReactions: topReactions,
            }}
            react={react}
          />
        ) : (
          ""
        )} */}
      </div>
    </div>
  );
};

export default MessageContent;
