import { PushpinOutlined } from "@ant-design/icons";

export type PinnedMessageProps = {
  message: string;
  contact?: string;
  mine?: boolean;
  replyId?: string;
  replyContent?: string;
  expanded?: boolean;
};

export function PinnedMessage(props: PinnedMessageProps) {
  return (
    <>
      <div className="inline-flex h-[2rem] items-center gap-[.5rem] text-sm italic text-light-blue-500">
        Pinned by {props.contact}
      </div>
      <p
        className={`overflow-hidden text-ellipsis ${props.expanded ? "line-clamp-none" : "line-clamp-3"}`}
      >
        {props.message}
      </p>
      <PushpinOutlined
        className={`absolute ${props.mine ? "right-[-.4rem]" : "left-[-.9rem]"} top-[-.8rem] rounded-[1rem] 
        bg-light-blue-500 px-[.2rem] py-[.7rem] text-xs text-white`}
        style={{
          strokeWidth: "80", // --> higher value === more thickness the filled area
          stroke: "white",
        }}
        rotate={316}
      />
    </>
  );
}

export function ForwardedMessage(props: PinnedMessageProps) {
  return (
    <>
      <div className="inline-flex h-[2rem] items-center gap-[.5rem] text-sm italic text-light-blue-500">
        {props.contact} have forwarded this message
      </div>
      <p
        className={`overflow-hidden text-ellipsis ${props.expanded ? "line-clamp-none" : "line-clamp-3"}`}
      >
        {props.message}
      </p>
      <i
        className={`fa fa-share absolute ${props.mine ? "rotate-x-50 right-[-.8rem]" : "left-[-.9rem]"} top-[-.8rem] rounded-[1rem] 
        bg-light-blue-500 px-[.2rem] py-[.7rem] text-xs text-white`}
      />
    </>
  );
}

export function ReplyMessage(props: PinnedMessageProps) {
  return (
    <>
      <div className="my-2 border-l-[.3rem] border-l-light-blue-500/50 px-3 py-2 text-sm">
        <p className="truncate">Reply to {props.contact}</p>
        <p className="truncate">{props.replyContent}</p>
      </div>
      <p
        className={`overflow-hidden text-ellipsis ${props.expanded ? "line-clamp-none" : "line-clamp-3"}`}
      >
        {props.message}
      </p>
    </>
  );
}
