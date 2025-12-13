import { PushpinOutlined } from "@ant-design/icons";
import { ReactNode, useEffect, useRef, useState } from "react";

export type MessageType = "pinned" | "forwarded" | "reply" | undefined;

export type PinnedMessageProps = {
  type?: MessageType;
  message: string;
  contact?: string;
  mine?: boolean;
  replyId?: string;
  replyContent?: string;
};

type MessageConfig = {
  header?: ReactNode;
  icon?: ReactNode;
  showExpandToggle: boolean;
};

export function PinnedMessage(props: PinnedMessageProps) {
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
  }, [props.message]);

  const getMessageConfig = (): MessageConfig => {
    switch (props.type) {
      case "pinned":
        return {
          header: (
            <div className="inline-flex h-[2rem] items-center gap-[.5rem] text-sm italic text-light-blue-500">
              Pinned by {props.contact}
            </div>
          ),
          icon: (
            <PushpinOutlined
              className={`absolute ${props.mine ? "right-[-.4rem]" : "left-[-.9rem]"} top-[-.8rem] rounded-[1rem] 
              bg-light-blue-500 px-[.2rem] py-[.7rem] text-xs text-white`}
              style={{
                strokeWidth: "80",
                stroke: "white",
              }}
              rotate={316}
            />
          ),
          showExpandToggle: true,
        };

      case "forwarded":
        return {
          header: (
            <div className="inline-flex h-[2rem] items-center gap-[.5rem] text-sm italic text-light-blue-500">
              {props.contact} have forwarded this message
            </div>
          ),
          icon: (
            <i
              className={`fa fa-share absolute ${props.mine ? "rotate-x-50 right-[-.8rem]" : "left-[-.9rem]"} top-[-.8rem] rounded-[1rem] 
              bg-light-blue-500 px-[.2rem] py-[.7rem] text-xs text-white`}
            />
          ),
          showExpandToggle: true,
        };

      case "reply":
        return {
          header: (
            <div className="my-2 border-l-[.3rem] border-l-light-blue-500/50 px-3 py-2 text-sm">
              <p className="truncate">Reply to {props.contact}</p>
              <p className="truncate">{props.replyContent}</p>
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
        className={`overflow-hidden text-ellipsis ${isExpanded ? "line-clamp-none" : "line-clamp-3"}`}
      >
        {props.message}
      </p>
      {/* MARK: SHOW MORE MESSAGE */}
      {config.showExpandToggle && isOverflowing && (
        <div
          className={`${props.mine ? "self-end" : ""} w-fit cursor-pointer text-base text-green-500`}
          onClick={() => {
            setIsExpanded((current) => !current);
          }}
        >
          {isExpanded ? "View less" : "View more"}
        </div>
      )}
      {config.icon}
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
