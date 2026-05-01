import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { reactMessage } from "../../services/message.service";
import "../../styles/messagecontent.css";
import { MessageReactionProps_Message_Reaction } from "../../types/base.types";
import {
  MessageCache,
  MessageContentProps,
  ReactMessageRequest,
} from "../../types/message.types";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import { ForwardedMessage, MessageItem, ReplyMessage } from "./MessageItem";
import MessageMenu_Slide from "./MessageMenu_Slide";

const MessageContent = forwardRef<HTMLDivElement, MessageContentProps>(
  (props, ref) => {
    const { message, id, showName, showAvatar } = props;
    if (!message) return null;

    const queryClient = useQueryClient();

    const { data: info } = useInfo();
    const { data: conversations } = useConversation();

    const { conversationId } = Route.useParams();
    const conversation = conversations?.conversations?.find(
      (c) => c.id === conversationId,
    );

    const [reaction, setReaction] =
      useState<MessageReactionProps_Message_Reaction>(() => {
        return {
          likeCount: message.likeCount ?? 0,
          loveCount: message.loveCount ?? 0,
          careCount: message.careCount ?? 0,
          wowCount: message.wowCount ?? 0,
          sadCount: message.sadCount ?? 0,
          angryCount: message.angryCount ?? 0,
          total:
            (message.likeCount ?? 0) +
            (message.loveCount ?? 0) +
            (message.careCount ?? 0) +
            (message.wowCount ?? 0) +
            (message.sadCount ?? 0) +
            (message.angryCount ?? 0),
          currentReaction: message.currentReaction,
        } as MessageReactionProps_Message_Reaction;
      });
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setReaction((current) => {
        return {
          ...current,
          likeCount: message.likeCount ?? 0,
          loveCount: message.loveCount ?? 0,
          careCount: message.careCount ?? 0,
          wowCount: message.wowCount ?? 0,
          sadCount: message.sadCount ?? 0,
          angryCount: message.angryCount ?? 0,
          total:
            (message.likeCount ?? 0) +
            (message.loveCount ?? 0) +
            (message.careCount ?? 0) +
            (message.wowCount ?? 0) +
            (message.sadCount ?? 0) +
            (message.angryCount ?? 0),
          currentReaction: message.currentReaction,
        } as MessageReactionProps_Message_Reaction;
      });

      if (contentRef.current) {
        const lineHeight = parseFloat(
          getComputedStyle(contentRef.current).lineHeight,
        );
        const maxHeight = lineHeight * 3;
        setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
      }

      setIsExpanded(false);
    }, [message]);

    const generateMostReaction = useCallback(() => {
      const reactions: Record<string, number> = {
        like: reaction.likeCount,
        love: reaction.loveCount,
        care: reaction.careCount,
        wow: reaction.wowCount,
        sad: reaction.sadCount,
        angry: reaction.angryCount,
      };

      return Object.entries(reactions)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => key);
    }, [reaction]);

    const [topReactions, setTopReactions] = useState(() =>
      generateMostReaction(),
    );

    useEffect(() => {
      setTopReactions(generateMostReaction());
    }, [reaction]);

    const react = (type: string) => {
      const isUnReact = reaction.currentReaction === type;
      const request: ReactMessageRequest = {
        conversationId: id,
        messageId: message.id ?? "",
        type: type,
        isUnReact: isUnReact,
      };
      reactMessage(request);
      queryClient.setQueryData(
        ["message", conversationId],
        (oldData: MessageCache) => {
          const reactionKeys: Record<string, string> = {
            like: "likeCount",
            love: "loveCount",
            care: "careCount",
            wow: "wowCount",
            sad: "sadCount",
            angry: "angryCount",
          };

          const previousReaction = reaction.currentReaction;
          const previousKey = previousReaction ? reactionKeys[previousReaction] : undefined;
          const newKey = reactionKeys[type];

          return {
            ...oldData,
            messages: (oldData.messages ?? []).map((mess) => {
              if (mess.id !== message.id) return mess;
              return {
                ...mess,
                currentReaction: isUnReact ? null : type,
                ...(previousKey && {
                  [previousKey]: (mess as any)[previousKey] - 1,
                }),
                ...(newKey &&
                  !isUnReact && {
                    [newKey]: ((mess as any)[newKey] || 0) + 1,
                  }),
              };
            }),
          } as MessageCache;
        },
      );
    };

    const isSelf = message.contactId === info?.id;

    const sender = !isSelf
      ? (conversation?.members ?? []).find((q) => q.contact?.id === message.contactId)
      : null;

    return (
      <div
        ref={ref}
        id={message.id}
        key={message.id}
        className={`flex shrink-0 gap-4 ${message.contactId === info?.id ? "mr-6 flex-row-reverse" : ""} `}
      >
        {!isSelf && (
          <div className="aspect-square h-8 shrink-0">
            {showAvatar && sender && (
              <ImageWithLightBoxAndNoLazy
                src={sender.contact?.avatar ?? undefined}
                className="h-full w-full cursor-pointer"
                circle
                slides={[{ src: sender.contact?.avatar ?? "" }]}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!isSelf && showName && sender && (
            <div
              className={`text-(--text-main-color-thin) flex items-center gap-4 ${message.contactId === info?.id ? "justify-end" : ""}`}
            >
              <p className="font-medium">{sender.contact?.name}</p>
            </div>
          )}

          <div
            className={`laptop-lg:max-w-120 laptop:max-w-100 desktop:max-w-220 relative flex w-fit flex-col
            ${message.contactId === info?.id ? "items-end" : "items-start"}
            ${(message.attachments?.length ?? 0) > 0 ? "gap-2" : ""}
          `}
          >
            <div className="peer flex w-full flex-col">
              <div
                ref={contentRef}
                className={`flex! overflow-visible! data-[expanded=false]:max-h-30  relative w-fit max-w-full cursor-pointer
                  flex-col gap-2 whitespace-pre-line break-all rounded-xl
                  data-[expanded=true]:line-clamp-none data-[expanded=true]:max-h-full
                  ${message.pending ? "opacity-50" : ""}
                  ${message.content || message.isForwarded || message.replyId ? "laptop-lg:py-2 laptop:py-2 laptop:px-4 laptop-lg:px-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]" : ""}
                `}
              >
                {message.isForwarded ? (
                  <ForwardedMessage
                    message={message.content ?? ""}
                    contact={
                      message.contactId === info?.id
                        ? "You"
                        : (conversation?.members ?? []).find(
                            (q) => q.contact?.id === message.contactId,
                          )?.contact?.name ?? ""
                    }
                    mine={message.contactId === info?.id}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                ) : message.replyId && message.replyContent ? (
                  <ReplyMessage
                    message={message.content ?? ""}
                    replyId={message.replyId}
                    replyContent={message.replyContent}
                    contact={
                      (conversation?.members ?? []).find(
                        (q) => q.contact?.id === message.replyContact,
                      )?.contact?.name ?? ""
                    }
                    mine={message.contactId === info?.id}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                ) : (
                  <MessageItem
                    message={message.content ?? ""}
                    contact={
                      (conversation?.members ?? []).find(
                        (q) => q.contact?.id === message.pinnedBy,
                      )?.contact?.name ?? ""
                    }
                    mine={message.contactId === info?.id}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                )}
              </div>
            </div>
            {message.isPinned && (
              <div
                className={`laptop:h-5.5 laptop:rounded-md laptop-lg:h-6 laptop-lg:rounded-lg absolute -top-2 flex aspect-square items-center justify-center bg-light-blue-500 shadow-md
                  ${message.contactId === info?.id ? "-right-3" : "-left-[.8rem]"}`}
              >
                <i className="fa-solid fa-thumbtack laptop-lg:text-2xs laptop:text-3xs text-white"></i>
              </div>
            )}
            {!message.pending && (
              <MessageMenu_Slide
                conversationId={id}
                message={message}
                mine={message.contactId === info?.id}
                contact={
                  (conversation?.members ?? []).find(
                    (q) => q.contact?.id === message.contactId,
                  )?.contact ?? {}
                }
                getContainerRect={props.getContainerRect}
              />
            )}
            <p
              data-mine={message.contactId === info?.id}
              className="message-time"
            >
              {dayjs(message.createdTime).format("HH:mm")}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

export default MessageContent;
