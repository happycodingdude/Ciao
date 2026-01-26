import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MessageReaction from "../../../components/MessageReaction";
import "../../../messagecontent.css";
import { MessageReactionProps_Message_Reaction } from "../../../types";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import { MessageCache } from "../../listchat/types";
import reactMessage from "../services/reactMessage";
import { MessageContentProps, ReactMessageRequest } from "../types";
import { ForwardedMessage, MessageItem, ReplyMessage } from "./MessageItem";
import MessageMenu_Slide from "./MessageMenu_Slide";

const MessageContent = forwardRef<HTMLDivElement, MessageContentProps>(
  (props, ref) => {
    const { message, id } = props;
    if (!message) return null;

    const queryClient = useQueryClient();

    const { data: info } = useInfo();
    const { data: conversations } = useConversation();

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
    // const messageRef = useRef<HTMLDivElement>(null);

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
        ref={ref}
        id={message.id}
        key={message.id}
        className={`flex shrink-0 gap-4 ${message.contactId === info.id ? "flex-row-reverse" : ""} mb-8`}
      >
        {/* MARK: SENDER AVATAR */}
        {message.contactId !== info.id ? (
          <ImageWithLightBoxAndNoLazy
            src={
              conversation.members.find(
                (q) => q.contact.id === message.contactId,
              )?.contact.avatar
            }
            className="h-10! aspect-square cursor-pointer"
            circle
            slides={[
              {
                src: conversation.members.find(
                  (q) => q.contact.id === message.contactId,
                )?.contact.avatar,
              },
            ]}
          />
        ) : (
          ""
        )}
        <div className="flex flex-col gap-2">
          <div
            className={`text-(--text-main-color-thin) flex items-center gap-4 ${message.contactId === info.id ? "justify-end" : ""}`}
          >
            {/* MARK: SENDER NAME */}
            {message.contactId !== info.id && (
              <p className="font-medium">
                {
                  conversation.members.find(
                    (q) => q.contact.id === message.contactId,
                  )?.contact.name
                }
              </p>
            )}

            {/* MARK: MESSAGE TIME */}
            <p>{dayjs(message.createdTime).format("HH:mm")}</p>
          </div>
          <div
            className={`laptop-lg:max-w-120 laptop:max-w-100 desktop:max-w-220 relative flex w-fit flex-col
            ${message.contactId === info.id ? "items-end" : "items-start"}
            ${message.attachments?.length > 0 ? "gap-2" : ""}
          `}
          >
            {/* MARK: CONTENT */}
            <div className="peer flex w-full flex-col">
              <div
                ref={contentRef}
                className={`flex! overflow-visible! data-[expanded=false]:max-h-30 laptop:py-1 laptop-lg:py-2 relative w-fit max-w-full cursor-pointer 
                  flex-col gap-2 whitespace-pre-line break-all rounded-xl
                  data-[expanded=true]:line-clamp-none data-[expanded=true]:max-h-full
                  ${message.pending ? "opacity-50" : ""} 
                  ${message.content || message.isForwarded || message.replyId ? "laptop:px-3 laptop-lg:px-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]" : ""}                  
                `}
              >
                {message.isForwarded ? (
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
                    isPinned={message.isPinned}
                    attachments={message.attachments}
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
                    mine={message.contactId === info.id}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                ) : (
                  <MessageItem
                    message={message.content}
                    contact={
                      conversation.members.find(
                        (q) => q.contact.id === message.pinnedBy,
                      )?.contact.name || ""
                    }
                    mine={message.contactId === info.id}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                )}
              </div>
            </div>
            {/* MARK: MESSAGE PIN */}
            {message.isPinned && (
              <div
                className={`laptop:h-5 laptop:rounded-md laptop-lg:h-6 laptop-lg:rounded-lg absolute -top-2 flex aspect-square items-center justify-center bg-light-blue-500 shadow-md
                  ${message.contactId === info.id ? "-right-2.5" : "-left-[.7rem]"}`}
              >
                <i className="fa-solid fa-thumbtack laptop-lg:text-3xs laptop:text-4xs text-white"></i>
              </div>
            )}
            {/* MARK: MESSAGE MENU */}
            <MessageMenu_Slide
              conversationId={id}
              message={message}
              mine={message.contactId === info.id}
              contact={
                conversation.members.find(
                  (q) => q.contact.id === message.contactId,
                )?.contact || {}
              }
              getContainerRect={props.getContainerRect}
            />
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
      </div>
    );
  },
);

export default MessageContent;
