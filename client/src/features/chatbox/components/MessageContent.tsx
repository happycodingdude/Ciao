import { PushpinOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MessageReaction from "../../../components/MessageReaction";
import "../../../messagecontent.css";
import { MessageReactionProps_Message_Reaction } from "../../../types";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import { MessageCache } from "../../listchat/types";
import reactMessage from "../services/reactMessage";
import { MessageContentProps, ReactMessageRequest } from "../types";
import MessageMenu from "./MessageMenu";

const MessageContent = (props: MessageContentProps) => {
  const { message, id, mt } = props;
  if (!message) return null;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const [reaction, setReaction] =
    useState<MessageReactionProps_Message_Reaction>(() => {
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
      } as MessageReactionProps_Message_Reaction;
    });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

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
      } as MessageReactionProps_Message_Reaction;
    });

    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight,
      );
      const maxHeight = lineHeight * 3; // 3 lines height
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }

    setIsExpanded(false);
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

  // const [topReactions, setTopReactions] = useState();

  useEffect(() => {
    setTopReactions(generateMostReaction());
  }, [reaction]);

  const react = (type: string) => {
    // console.log(`reaction type => ${type}...`);
    const isUnReact = reaction.currentReaction === type;
    const request: ReactMessageRequest = {
      conversationId: id,
      messageId: message.id,
      type: type,
      isUnReact: isUnReact,
    };
    reactMessage(request);
    queryClient.setQueryData(["message"], (oldData: MessageCache) => {
      const reactionKeys = {
        like: "likeCount",
        love: "loveCount",
        care: "careCount",
        wow: "wowCount",
        sad: "sadCount",
        angry: "angryCount",
      };

      const previousReaction = reaction.currentReaction;
      const previousKey = reactionKeys[previousReaction];
      const newKey = reactionKeys[type];

      return {
        ...oldData,
        messages: oldData.messages.map((mess) => {
          if (mess.id !== message.id) return mess;
          return {
            ...mess,
            currentReaction: isUnReact ? null : type,
            ...(previousKey && {
              [previousKey]: mess[previousKey] - 1,
            }),
            ...(newKey &&
              !isUnReact && {
                [newKey]: (mess[newKey] || 0) + 1,
              }),
          };
        }),
      } as MessageCache;
    });

    // setReaction((current) => {
    //   const reactionKeys = {
    //     like: "likeCount",
    //     love: "loveCount",
    //     care: "careCount",
    //     wow: "wowCount",
    //     sad: "sadCount",
    //     angry: "angryCount",
    //   };

    //   const previousReaction = current.currentReaction;
    //   const previousKey = reactionKeys[previousReaction];
    //   const newKey = reactionKeys[type];

    //   return {
    //     ...current,
    //     total:
    //       previousReaction && !isUnReact
    //         ? current.total
    //         : isUnReact
    //           ? current.total - 1
    //           : current.total + 1,
    //     currentReaction: isUnReact ? null : type,
    //     ...(previousKey && {
    //       [previousKey]: current[previousKey] - 1,
    //     }),
    //     ...(newKey &&
    //       !isUnReact && {
    //         [newKey]: (current[newKey] || 0) + 1,
    //       }),
    //   };
    // });
  };

  const refMenu = useRef<HTMLDivElement>(null);
  const [dropUp, setDropUp] = useState(false);
  // useEffect(() => {
  //   if (!messageRef.current) return;

  //   const menuRect = refMenu.current?.getBoundingClientRect();
  //   const chatRect = props.containerRef.current?.getBoundingClientRect();

  //   // Nếu menu vượt qua đáy chat box
  //   if (menuRect.bottom > chatRect.bottom) {
  //     setDropUp(true); // Điều chỉnh theo thực tế layout của bạn
  //   }

  //   // Nếu không đủ khoảng cách phía dưới (ví dụ < 200px), bật drop-up
  //   // setDropUp(spaceBelow < 500);
  // });

  return (
    <div
      ref={messageRef}
      id={message.id}
      key={message.id}
      // className={`flex shrink-0 gap-[1rem] ${message.contactId === info.id ? "flex-row-reverse" : ""} ${mt ? "mt-auto" : ""}
      // phone:text-base laptop:text-sm laptop-lg:text-sm`}
      className={`flex shrink-0 gap-[1rem] ${message.contactId === info.id ? "flex-row-reverse" : ""} ${mt ? "mt-auto" : ""}`}
      // style={{ height: `${height}px` }}
    >
      {/* MARK: SENDER AVATAR */}
      {message.contactId !== info.id ? (
        <div className="relative w-[4rem] self-start">
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
          phone:w-[30rem] laptop:w-[clamp(40rem,50%,60rem)] desktop:w-[clamp(40rem,70%,80rem)] 
          ${message.contactId === info.id ? "items-end" : "items-start"}
          ${message.isPinned ? "gap-[.5rem]" : ""}
          `}
      >
        <div
          className={`flex items-center gap-[1rem] text-[var(--text-main-color-thin)] ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
        >
          {/* MARK: SENDER NAME */}
          {message.contactId === info.id ? (
            ""
          ) : (
            <p className="font-['Be_Vietnam_Pro'] font-semibold">
              {
                conversations.selected?.members.find(
                  (q) => q.contact.id === message.contactId,
                )?.contact.name
              }
            </p>
          )}

          {/* MARK: MESSAGE TIME */}
          <p>
            {moment(message.createdTime).format("DD/MM/YYYY") ===
            moment().format("DD/MM/YYYY")
              ? moment(message.createdTime).format("HH:mm")
              : moment(message.createdTime).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>

        {/* MARK: ATTACHMENT */}
        {/* {message.attachments && message.attachments.length !== 0 ? (
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
                          ? "w-[30%]"
                          : "w-[25%]"
                      }`}
                    slides={message.attachments.map((item) => ({
                      src: item.type === "image" ? item.mediaUrl : "",
                    }))}
                    index={index}
                    pending={item.pending}
                    local={item.local}
                  />
                );
              })}
            </div>
          ) : (
            <div
              className={`grid grid-cols-[20rem_12rem] gap-2 laptop:h-[20rem] ${
                message.contactId === info.id ? "justify-end" : ""
              }`}
              // style={{ gridTemplateRows: "auto auto" }} // Explicit row structure for Firefox
            >
              {message.attachments.slice(0, 3).map((attachment, index) => (
                <ImageWithLightBoxAndNoLazy
                  key={index}
                  src={attachment.mediaUrl}
                  title={attachment.mediaName?.split(".")[0]}
                  className={`loaded cursor-pointer ${
                    index === 0 ? "row-span-2 aspect-square min-h-[12rem]" : ""
                  }`}
                  slides={message.attachments.map((item) => ({
                    src: item.type === "image" ? item.mediaUrl : "",
                  }))}
                  index={index}
                  pending={attachment.pending}
                  local={attachment.local}
                />
              ))}
            </div>
          )
        ) : (
          ""
        )} */}

        {message.attachments && message.attachments.length !== 0 ? (
          <div className="relative">
            <div className="grid grid-cols-4 gap-2">
              {message.attachments?.slice(0, 5).map((src, index) => {
                const isFirst = index === 0;
                const isLast =
                  index === 5 - 1 && message.attachments?.length > 5;

                return (
                  <div
                    key={index}
                    className={isFirst ? "col-span-2 row-span-2" : ""}
                  >
                    <div className="relative aspect-square w-full">
                      {/* <img
                      src={src.mediaUrl}
                      className="h-full w-full rounded-xl object-cover"
                      alt={`Image ${index + 1}`}
                    /> */}
                      <ImageWithLightBoxAndNoLazy
                        key={index}
                        src={src.mediaUrl}
                        title={src.mediaName?.split(".")[0]}
                        className={`loaded aspect-square cursor-pointer ${isFirst ? "w-full" : "w-[10rem]"}`}
                        slides={message.attachments.map((item) => ({
                          src: item.type === "image" ? item.mediaUrl : "",
                        }))}
                        index={index}
                        pending={src.pending}
                        local={src.local}
                      />
                      {isLast && (
                        <div className="mosaic-overlay pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              +{message.attachments?.length - 5}
                            </div>
                            <div className="text-xs text-white opacity-80">
                              more photos
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          ""
        )}

        {/* MARK: CONTENT */}
        {message.content ? (
          <>
            <div className="relative flex flex-col">
              <div
                ref={contentRef}
                data-expanded={isExpanded}
                className={`cursor-pointer whitespace-pre-line break-all rounded-[1rem] ${message.pending ? "opacity-50" : ""} my-[.5rem] px-[1.6rem] leading-[3rem]
                  ${
                    message.isPinned
                      ? message.contactId === info.id
                        ? "border-r-[.4rem] border-[var(--pinned-message-container-border-color)] bg-[var(--pinned-message-container-bg-color)]"
                        : "border-l-[.4rem] border-[var(--pinned-message-container-border-color)] bg-[var(--pinned-message-container-bg-color)]"
                      : message.contactId === info.id
                        ? "bg-[var(--main-color)]"
                        : "bg-[var(--bg-color)]"
                  }            
                  !flex w-fit
                  flex-col self-end
                  shadow-[0_2px_10px_rgba(0,0,0,0.1)] data-[expanded=false]:line-clamp-3
                  data-[expanded=true]:line-clamp-none
                  data-[expanded=false]:max-h-[9rem] data-[expanded=true]:max-h-full
                  ${message.isPinned ? " pt-[1rem]" : ""}
            `}
              >
                {message.isPinned ? (
                  <div
                    className="inline-flex h-[2rem] items-center gap-[.5rem]
                    text-sm text-[var(--pinned-message-container-icon-color)]"
                  >
                    Pinned by{" "}
                    {
                      conversations.selected?.members.find(
                        (q) => q.contact.id === message.pinnedBy,
                      )?.contact.name
                    }
                  </div>
                ) : (
                  ""
                )}
                <p>{message.content}</p>
              </div>
              {message.isPinned ? (
                <PushpinOutlined
                  className={`absolute ${message.contactId === info.id ? "right-[-.4rem]" : "left-[-.4rem]"}  top-[-.2rem] z-[11] rounded-[1rem] 
                  bg-[var(--pinned-message-container-icon-color)] 
                  px-[.2rem] py-[.7rem] text-xs text-white`}
                  rotate={316}
                />
              ) : (
                ""
              )}
              {/* MARK: MESSAGE MENU */}
              <MessageMenu
                conversationId={id}
                id={message.id}
                message={message.content}
                mine={message.contactId === info.id}
                pinned={message.isPinned}
                getContainerRect={props.getContainerRect}
                getContentRect={() =>
                  contentRef.current?.getBoundingClientRect()
                }
              />
            </div>

            {/* MARK: SHOW MORE MESSAGE */}
            {isOverflowing && (
              <div
                // className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer text-base text-green-500"
                className={`absolute bottom-[-1.2rem] ${message.contactId === info.id ? "left-[3rem]" : "right-[3rem]"} cursor-pointer text-base text-green-500`}
                onClick={() => {
                  setIsExpanded((current) => !current);
                }}
              >
                {isExpanded ? "View less" : "View more"}
              </div>
            )}
          </>
        ) : (
          ""
        )}

        {/* MARK: REACTION */}
        <MessageReaction
          message={{
            mine: message.contactId === info.id,
            reaction: reaction,
            topReactions: topReactions,
          }}
          react={react}
          pending={message.pending}
        />
      </div>
    </div>
  );
};

export default MessageContent;
