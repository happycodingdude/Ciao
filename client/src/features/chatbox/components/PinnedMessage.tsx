import { ReactNode, useEffect, useRef, useState } from "react";
import { renderMessageWithMentions } from "../../../utils/renderMention";

export type MessageType = "forwarded" | "reply" | undefined;

export type PinnedMessageProps = {
  type?: MessageType;
  message: string;
  contact?: string;
  mine?: boolean;
  isPinned?: boolean;
  replyId?: string;
  replyContent?: string;
};

type MessageConfig = {
  header?: ReactNode;
  icon?: ReactNode;
  showExpandToggle: boolean;
};

export function PinnedMessage(props: PinnedMessageProps) {
  const { type, message, contact, mine, isPinned, replyContent } = props;
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
            <div className="mb-2 border-l-[.3rem] border-l-light-blue-500/50 px-3">
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
      <p
        ref={contentRef}
        className={`overflow-hidden text-ellipsis leading-8 ${isExpanded ? "line-clamp-none" : "line-clamp-3"}`}
      >
        {renderMessageWithMentions(message)}
      </p>
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
export function ForwardedMessage(props: Omit<PinnedMessageProps, "type">) {
  return <PinnedMessage {...props} type="forwarded" />;
}

export function ReplyMessage(props: Omit<PinnedMessageProps, "type">) {
  return <PinnedMessage {...props} type="reply" />;
}
