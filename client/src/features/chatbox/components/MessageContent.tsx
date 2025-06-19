import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MessageReaction from "../../../components/MessageReaction";
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

  const [dropUp, setDropUp] = useState(false);
  useEffect(() => {
    if (!messageRef.current) return;

    const rect = messageRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    // Nếu không đủ khoảng cách phía dưới (ví dụ < 150px), bật drop-up
    setDropUp(spaceBelow < 150);
  });

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
          phone:w-[30rem] laptop:w-[clamp(40rem,50%,60rem)] desktop:w-[clamp(40rem,70%,80rem)] 
          ${message.contactId === info.id ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex items-center gap-[1rem] text-[var(--text-main-color-thin)] ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
        >
          {/* MARK: SENDER NAME */}
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

          {/* MARK: MESSAGE TIME */}
          <p>
            {moment(message.createdTime).format("DD/MM/YYYY") ===
            moment().format("DD/MM/YYYY")
              ? moment(message.createdTime).format("HH:mm")
              : moment(message.createdTime).format("DD/MM/YYYY HH:mm")}
          </p>

          {message.isPinned ? (
            <p className="text-orange-500">
              pinned by{" "}
              {
                conversations.selected?.members.find(
                  (q) => q.contact.id === message.pinnedBy,
                )?.contact.name
              }
            </p>
          ) : (
            ""
          )}
        </div>

        {/* MARK: ATTACHMENT */}
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
        )}

        {/* MARK: CONTENT */}
        {message.content ? (
          <>
            <div className="relative">
              <div
                ref={contentRef}
                data-expanded={isExpanded}
                className={`cursor-pointer whitespace-pre-line break-all rounded-[2rem] ${message.pending ? "opacity-50" : ""} my-[.5rem] px-[1.6rem] leading-[3rem]
            ${
              message.contactId === info.id
                ? "bg-[var(--main-color)]"
                : "bg-[var(--bg-color-light)]"
            }
            data-[expanded=false]:line-clamp-3 data-[expanded=true]:line-clamp-none
            data-[expanded=false]:max-h-[9rem] data-[expanded=true]:max-h-full
            `}
              >
                {message.content}
              </div>
              {/* MARK: Message menu */}
              <MessageMenu
                conversationId={id}
                id={message.id}
                message={message.content}
                mine={message.contactId === info.id}
                pinned={message.isPinned}
                dropUp={dropUp}
              />
            </div>

            {/* MARK: Show more message */}
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
