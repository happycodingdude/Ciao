import { PushpinOutlined } from "@ant-design/icons";

export type PinnedMessageProps = {
  message: string;
  contact?: string;
  mine?: boolean;
  replyId?: string;
  replyContent?: string;
};

export function PinnedMessage(props: PinnedMessageProps) {
  return (
    <>
      <div className="inline-flex h-[2rem] items-center gap-[.5rem] italic text-sm text-light-blue-500">
        Pinned by {props.contact}
      </div>
      <p>{props.message}</p>
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
      <div className="inline-flex h-[2rem] items-center gap-[.5rem] italic text-sm text-light-blue-500">
        {props.contact} have forwarded this message
      </div>
      <p>{props.message}</p>
      <i
        className={`fa fa-share absolute ${props.mine ? "right-[-.4rem]" : "left-[-.9rem]"} top-[-.8rem] rounded-[1rem] 
        bg-light-blue-500 px-[.2rem] py-[.7rem] text-xs text-white`}
      />
    </>
  );
}

export function ReplyMessage(props: PinnedMessageProps) {
  return (
    <>
      <div className="mb-2 rounded-lg border border-light-blue-500/30 bg-light-blue-500/20 px-3 py-2">
        <p className="truncate text-sm">{props.replyContent}</p>
      </div>
      <p>{props.message}</p>
    </>
  );
}
