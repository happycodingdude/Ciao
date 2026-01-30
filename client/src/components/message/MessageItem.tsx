import { ReactNode, useEffect, useRef, useState } from "react";
import { AttachmentModel } from "../../types/message.types";
import { renderMessageWithMentions } from "../../utils/renderMention";
import { MessageImageGrid } from "./MessageImageGrid";

export type MessageType = "forwarded" | "reply" | undefined;

export type MessageItemProps = {
  type?: MessageType;
  message: string;
  contact?: string;
  mine?: boolean;
  isPinned?: boolean;
  replyId?: string;
  replyContent?: string;
  attachments?: AttachmentModel[];
};

type MessageConfig = {
  header?: ReactNode;
  icon?: ReactNode;
  showExpandToggle: boolean;
};

export function MessageItem(props: MessageItemProps) {
  const { type, message, contact, mine, isPinned, replyContent, attachments } =
    props;
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight,
      );
      const maxHeight = lineHeight * 3; // 3 lines height
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }

    setIsExpanded(false);
  }, [message]);

  const getMessageConfig = (): MessageConfig => {
    switch (type) {
      case "forwarded":
        return {
          header: (
            <div className="inline-flex h-8 items-center gap-2 italic text-light-blue-500">
              {contact} have forwarded this message
            </div>
          ),
          icon: (
            <i
              className={`fa-solid fa-share absolute ${mine ? "fa-rotate-180 -right-3" : "-left-3.5"} -top-4 rounded-2xl 
              bg-light-blue-500 px-[.2rem] py-[.7rem] text-white`}
            />
          ),
          showExpandToggle: true,
        };

      case "reply":
        return {
          header: (
            <div className="border-l-[.3rem] border-l-light-blue-500/50 px-3 leading-6">
              <p className="truncate italic text-light-blue-500">
                Reply to {contact}
              </p>
              <p className="truncate">{replyContent}</p>
            </div>
          ),
          showExpandToggle: true,
        };

      default:
        return {
          showExpandToggle: true,
        };
    }
  };

  const config = getMessageConfig();

  return (
    <>
      {config.header}
      {attachments?.length > 0 && (
        <MessageImageGrid attachments={attachments} />
      )}
      {message && (
        <p
          ref={contentRef}
          className={`laptop:leading-6 laptop-lg:leading-8 overflow-hidden text-ellipsis ${mine ? "self-end" : ""} ${isExpanded ? "line-clamp-none" : "line-clamp-3"}`}
        >
          {renderMessageWithMentions(message)}
        </p>
      )}
      {/* MARK: SHOW MORE MESSAGE */}
      {config.showExpandToggle && isOverflowing && (
        <div
          className={`${mine ? "self-end" : ""} w-fit cursor-pointer text-green-500`}
          onClick={() => {
            setIsExpanded((current) => !current);
          }}
        >
          {isExpanded ? "View less" : "View more"}
        </div>
      )}
      {/* {config.icon} */}
    </>
  );
}

// Legacy exports for backward compatibility
export function ForwardedMessage(props: Omit<MessageItemProps, "type">) {
  return <MessageItem {...props} type="forwarded" />;
}

export function ReplyMessage(props: Omit<MessageItemProps, "type">) {
  return <MessageItem {...props} type="reply" />;
}
