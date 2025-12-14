import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { ForwardedMessage, PinnedMessage, ReplyMessage } from "./PinnedMessage";

const MessageContent = (props: MessageContentProps) => {
  const { message, id } = props;
  if (!message) return null;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  // const [conversationId] = useLocalStorage<string>("conversationId");
  // const conversation = conversations.filterConversations.find(
  //   (c) => c.id === conversationId,
  // );
  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

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
      const maxHeight = lineHeight * 3; // 4 lines height
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
    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) => {
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
      },
    );
  };

  return (
    <div
      ref={messageRef}
      id={message.id}
      key={message.id}
      className={`flex shrink-0 gap-4 ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
    >
      {/* MARK: SENDER AVATAR */}
      {message.contactId !== info.id ? (
        <div className="relative w-16 self-start">
          <ImageWithLightBoxAndNoLazy
            src={
              conversation.members.find(
                (q) => q.contact.id === message.contactId,
              )?.contact.avatar
            }
            className="aspect-square w-full cursor-pointer"
            circle
            slides={[
              {
                src: conversation.members.find(
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
          phone:w-120 laptop:w-[clamp(40rem,50%,60rem)] desktop:w-[clamp(40rem,70%,80rem)] 
          ${message.contactId === info.id ? "items-end" : "items-start"}
          ${message.isPinned || message.isForwarded ? "gap-2" : ""}
          `}
      >
        <div
          className={`text-(--text-main-color-thin) flex items-center gap-4`}
        >
          {/* MARK: SENDER NAME */}
          <p className="font-['Be_Vietnam_Pro'] font-semibold">
            {message.contactId === info.id
              ? "You"
              : conversation.members.find(
                  (q) => q.contact.id === message.contactId,
                )?.contact.name}
          </p>

          {/* MARK: MESSAGE TIME */}
          <p>{dayjs(message.createdTime).format("HH:mm")}</p>
        </div>
        {/* MARK: ATTACHMENT */}
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
                      <ImageWithLightBoxAndNoLazy
                        key={index}
                        src={src.mediaUrl}
                        title={src.mediaName?.split(".")[0]}
                        className={`loaded aspect-square cursor-pointer ${isFirst ? "w-full" : "w-40"}`}
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
        {/* $
        {message.contactId === info.id
          ? "bg-blue-500 text-white"
          : "bg-[var(--bg-color)]"} */}
        {/* MARK: CONTENT */}
        {message.content ? (
          <>
            <div className="relative flex flex-col">
              <div
                ref={contentRef}
                className={`cursor-pointer whitespace-pre-line break-all rounded-2xl ${message.pending ? "opacity-50" : ""} 
                bg-(--bg-color) my-2 px-[1.6rem] leading-8
                  ${
                    message.isPinned || message.isForwarded
                      ? message.contactId === info.id
                        ? "border-r-[.4rem] border-light-blue-500"
                        : "border-l-[.4rem] border-light-blue-500"
                      : ""
                  }                                       
                  flex! overflow-visible! relative w-fit flex-col
                  shadow-[0_2px_10px_rgba(0,0,0,0.1)] 
                  data-[expanded=true]:line-clamp-none
                  data-[expanded=false]:max-h-40 data-[expanded=true]:max-h-full
                  ${message.isPinned || message.isForwarded || message.replyId ? " py-2" : "py-[.8rem]"}
                `}
              >
                {message.isPinned ? (
                  <PinnedMessage
                    type="pinned"
                    message={message.content}
                    contact={
                      conversation.members.find(
                        (q) => q.contact.id === message.pinnedBy,
                      )?.contact.name || ""
                    }
                    mine={message.contactId === info.id}
                  />
                ) : message.isForwarded ? (
                  <ForwardedMessage
                    message={message.content}
                    contact={
                      message.contactId === info.id
                        ? "You"
                        : conversation.members.find(
                            (q) => q.contact.id === message.contactId,
                          )?.contact.name
                    }
                    mine={message.contactId === info.id}
                  />
                ) : message.replyId && message.replyContent ? (
                  <ReplyMessage
                    message={message.content}
                    replyId={message.replyId}
                    replyContent={message.replyContent}
                    contact={
                      conversation.members.find(
                        (q) => q.contact.id === message.replyContact,
                      )?.contact.name || ""
                    }
                  />
                ) : (
                  <PinnedMessage
                    message={message.content}
                    contact={
                      conversation.members.find(
                        (q) => q.contact.id === message.pinnedBy,
                      )?.contact.name || ""
                    }
                    mine={message.contactId === info.id}
                  />
                )}
              </div>

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
            {/* {isOverflowing && (
              <div
                className={`absolute bottom-[-1.2rem] ${message.contactId === info.id ? "left-[3rem]" : "right-[3rem]"} cursor-pointer text-base text-green-500`}
                onClick={() => {
                  setIsExpanded((current) => !current);
                }}
              >
                {isExpanded ? "View less" : "View more"}
              </div>
            )} */}
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
