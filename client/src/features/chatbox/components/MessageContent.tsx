import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MessageReaction from "../../../components/MessageReaction";
import { ReactionModel } from "../../../types";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import reactMessage from "../services/reactMessage";
import { MessageContentProps, ReactMessageRequest } from "../types";

const MessageContent = (props: MessageContentProps) => {
  // console.log("MessageContent calling");
  const { message, id, mt } = props;

  if (!message) return null;

  // console.log(JSON.stringify(message));

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const [reaction, setReaction] = useState<ReactionModel>(() => {
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

  const react = (type: string) => {
    // console.log(`reaction type => ${type}...`);
    const isDesc = reaction.currentReaction === type;
    const request: ReactMessageRequest = {
      conversationId: id,
      messageId: message.id,
      type: type,
      isDesc: isDesc,
    };
    reactMessage(request);
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
          previousReaction && !isDesc
            ? current.total
            : isDesc
              ? current.total - 1
              : current.total + 1,
        currentReaction: isDesc ? null : type,
        ...(previousKey && {
          [previousKey]: current[previousKey] - 1,
        }),
        ...(newKey &&
          !isDesc && {
            [newKey]: (current[newKey] || 0) + 1,
          }),
      };
    });
  };

  return (
    <div
      id={message.id}
      key={message.id}
      className={`flex shrink-0 gap-[1rem] ${message.contactId === info.id ? "flex-row-reverse" : ""} ${mt ? "mt-auto" : ""} 
      phone:text-base laptop:text-sm laptop-lg:text-sm`}
      // style={{ height: `${height}px` }}
    >
      {/* Sender avatar */}
      {message.contactId !== info.id ? (
        <div className="relative w-[3rem] self-start">
          <ImageWithLightBoxAndNoLazy
            src={
              conversations.selected?.members.find(
                (q) => q.contact.id === message.contactId,
              )?.contact.avatar
            }
            className="aspect-square w-full cursor-pointer"
            circle
            slides={[
              {
                src: conversations.selected?.members.find(
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
        className={`relative flex flex-col 
          phone:w-[30rem] laptop:w-[clamp(60rem,70%,80rem)] desktop:w-[clamp(40rem,70%,80rem)] 
          ${message.contactId === info.id ? "items-end" : "items-start"}`}
      >
        {/* Sender infor */}
        <div
          className={`flex items-center gap-[1rem] text-[var(--text-main-color-thin)] ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
        >
          {message.contactId === info.id ? (
            ""
          ) : (
            <p className="">
              {
                conversations.selected?.members.find(
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

        {/* Attachment */}
        {/* {message.attachments && message.attachments.length !== 0 ? (
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
        )} */}

        {message.attachments && message.attachments.length !== 0 ? (
          message.attachments?.length <= 2 ? (
            <div
              className={`flex w-full flex-wrap ${message.contactId === info.id ? "justify-end" : ""} gap-[1rem]`}
            >
              {message.attachments.map((item, index) => {
                return (
                  <ImageWithLightBoxAndNoLazy
                    src={item.mediaUrl}
                    title={item.mediaName?.split(".")[0]}
                    className={`aspect-square cursor-pointer               
                      ${
                        message.attachments?.length === 1
                          ? "w-[40%]"
                          : "w-[45%]"
                      }`}
                    // imageClassName={
                    //   message.attachments?.length === 1
                    //     ? "bg-[size:140%]"
                    //     : "bg-[size:140%]"
                    // }
                    // imageClassName="bg-[size:140%]"
                    slides={message.attachments.map((item) => ({
                      src: item.type === "image" ? item.mediaUrl : "",
                    }))}
                    index={index}
                    pending={item.pending}
                  />
                );
              })}
            </div>
          ) : (
            <div
              className={`flex w-full  ${message.contactId === info.id ? "justify-end" : ""} gap-[.5rem] laptop:h-[20rem]`}
            >
              <ImageWithLightBoxAndNoLazy
                src={message.attachments[0].mediaUrl}
                title={message.attachments[0].mediaName?.split(".")[0]}
                className={`loaded aspect-square w-[30%] cursor-pointer`}
                // imageClassName="bg-[size:170%]"
                slides={message.attachments.map((item) => ({
                  src: item.type === "image" ? item.mediaUrl : "",
                }))}
                index={0}
                pending={message.attachments[0].pending}
              />
              <div className="flex w-[20%] flex-col justify-between">
                <ImageWithLightBoxAndNoLazy
                  src={message.attachments[1].mediaUrl}
                  title={message.attachments[1].mediaName?.split(".")[0]}
                  className={`loaded h-[45%] w-full cursor-pointer`}
                  // imageClassName="bg-[size:120%]"
                  slides={message.attachments.map((item) => ({
                    src: item.type === "image" ? item.mediaUrl : "",
                  }))}
                  index={1}
                  pending={message.attachments[1].pending}
                />
                <ImageWithLightBoxAndNoLazy
                  src={message.attachments[2].mediaUrl}
                  title={message.attachments[2].mediaName?.split(".")[0]}
                  className={`loaded h-[45%] w-full cursor-pointer`}
                  // imageClassName="bg-[size:120%]"
                  slides={message.attachments.map((item) => ({
                    src: item.type === "image" ? item.mediaUrl : "",
                  }))}
                  index={2}
                  pending={message.attachments[2].pending}
                />
              </div>
            </div>
          )
        ) : (
          ""
        )}

        {/* Content */}
        {message.content ? (
          <div
            // className={` break-all rounded-[1rem] ${pending ? "opacity-50" : ""} my-[.5rem] px-[1rem] leading-[5rem]
            // ${
            //   message.contactId === info.id
            //     ? "rounded-tr-none bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] text-[var(--text-sub-color)]"
            //     : "rounded-tl-none bg-[var(--bg-color-extrathin)] text-[var(--text-main-color)]"
            // }`}
            className={`cursor-pointer whitespace-pre-line break-all rounded-[2rem] ${message.pending ? "opacity-50" : ""} my-[.5rem] px-[1.6rem] leading-[3rem]
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

        {/* Reaction */}
        <MessageReaction
          message={{
            mine: message.contactId === info.id,
            reaction: reaction,
            topReactions: topReactions,
          }}
          react={react}
          pending={message.pending}
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
