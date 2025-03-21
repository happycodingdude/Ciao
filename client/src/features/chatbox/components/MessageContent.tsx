import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MessageReaction from "../../../components/MessageReaction";
import { MessageReactionProps_Message_Reaction } from "../../../types";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import reactMessage from "../services/reactMessage";
import { MessageContentProps, ReactMessageRequest } from "../types";

const MessageContent = (props: MessageContentProps) => {
  // console.log("MessageContent calling");
  const { message, id, mt } = props;

  if (!message) return null;

  // console.log(JSON.stringify(message));

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const [reaction, setReaction] =
    useState<MessageReactionProps_Message_Reaction>(() => {
      return {
        // likeCount: message.likeCount,
        // loveCount: message.loveCount,
        // careCount: message.careCount,
        // wowCount: message.wowCount,
        // sadCount: message.sadCount,
        // angryCount: message.angryCount,
        total: 0,
        currentReaction:
          message.reactions.find((reaction) => reaction.contactId === info.id)
            ?.type || null,
      } as MessageReactionProps_Message_Reaction;
    });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReaction((current) => {
      return {
        ...current,
        // likeCount: message.likeCount,
        // loveCount: message.loveCount,
        // careCount: message.careCount,
        // wowCount: message.wowCount,
        // sadCount: message.sadCount,
        // angryCount: message.angryCount,
        // total:
        //   message.likeCount +
        //   message.loveCount +
        //   message.careCount +
        //   message.wowCount +
        //   message.sadCount +
        //   message.angryCount,
        total: 0,
        currentReaction:
          message.reactions.find((reaction) => reaction.contactId === info.id)
            ?.type || null,
      } as MessageReactionProps_Message_Reaction;
    });

    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight,
      );
      const maxHeight = lineHeight * 3; // 3 lines height
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }
  }, [message]);

  // const generateMostReaction = useCallback(() => {
  //   const reactions = {
  //     like: reaction.likeCount,
  //     love: reaction.loveCount,
  //     care: reaction.careCount,
  //     wow: reaction.wowCount,
  //     sad: reaction.sadCount,
  //     angry: reaction.angryCount,
  //   };

  //   return Object.entries(reactions)
  //     .filter(([_, count]) => count > 0) // Exclude zero counts
  //     .sort((a, b) => b[1] - a[1]) // Sort by count
  //     .slice(0, 3) // Get the top 3
  //     .map(([key]) => key); // Extract reaction names
  // }, [reaction]);

  // const [topReactions, setTopReactions] = useState(() =>
  //   generateMostReaction(),
  // );

  const [topReactions, setTopReactions] = useState();

  useEffect(() => {
    // setTopReactions(generateMostReaction());
  }, [reaction]);

  const react = (type: string) => {
    // console.log(`reaction type => ${type}...`);
    const isDesc = reaction.currentReaction === type;
    const request: ReactMessageRequest = {
      conversationId: id,
      messageId: message.id,
      type: type,
      isDesc: isDesc,
    };
    reactMessage(request);
    setReaction((current) => {
      const reactionKeys = {
        like: "likeCount",
        love: "loveCount",
        care: "careCount",
        wow: "wowCount",
        sad: "sadCount",
        angry: "angryCount",
      };

      const previousReaction = current.currentReaction;
      const previousKey = reactionKeys[previousReaction];
      const newKey = reactionKeys[type];

      return {
        ...current,
        // total:
        //   previousReaction && !isDesc
        //     ? current.total
        //     : isDesc
        //       ? current.total - 1
        //       : current.total + 1,
        currentReaction: isDesc ? null : type,
        ...(previousKey && {
          [previousKey]: current[previousKey] - 1,
        }),
        ...(newKey &&
          !isDesc && {
            [newKey]: (current[newKey] || 0) + 1,
          }),
      };
    });
  };

  return (
    <div
      id={message.id}
      key={message.id}
      className={`flex shrink-0 gap-[1rem] ${message.contactId === info.id ? "flex-row-reverse" : ""} ${mt ? "mt-auto" : ""} 
      phone:text-base laptop:text-sm laptop-lg:text-sm`}
      // style={{ height: `${height}px` }}
    >
      {/* Sender avatar */}
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
        {/* Sender infor */}
        <div
          className={`flex items-center gap-[1rem] text-[var(--text-main-color-thin)] ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
        >
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

          <p>
            {moment(message.createdTime).format("DD/MM/YYYY") ===
            moment().format("DD/MM/YYYY")
              ? moment(message.createdTime).format("HH:mm")
              : moment(message.createdTime).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>

        {/* Attachment */}
        {/* {message.attachments && message.attachments.length !== 0 ? (
          <div
            className={`flex w-full flex-wrap ${message.contactId === info.id ? "justify-end" : ""} gap-[1rem]`}
          >
            {message.attachments.map((item, index) => {
              // return message.noLazy ? (
              //   <ImageWithLightBoxAndNoLazy
              //     src={item.mediaUrl}
              //     title={item.mediaName?.split(".")[0]}
              //     className={`aspect-[3/2] cursor-pointer !bg-[size:110%]
              //       ${message.loaded ? "loaded" : ""}
              //       ${message.attachments?.length === 1 ? "!w-[70%]" : "!w-[30%]"}`}
              //     slides={message.attachments.map((item) => ({
              //       src: item.type === "image" ? item.mediaUrl : "",
              //     }))}
              //     index={index}
              //   />
              // ) : (
              //   <ImageWithLightBox
              //     src={item.mediaUrl}
              //     title={item.mediaName?.split(".")[0]}
              //     className={`aspect-[3/2] ${message.attachments?.length === 1 ? "!w-[70%]" : "!w-[30%]"} cursor-pointer`}
              //     slides={message.attachments.map((item) => ({
              //       src: item.type === "image" ? item.mediaUrl : "",
              //     }))}
              //     index={index}
              //     imageClassName="!bg-[size:100%]"
              //   />
              // );

              return (
                <ImageWithLightBoxAndNoLazy
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  className={`loaded aspect-[3/2] cursor-pointer !bg-[size:110%]                      
                      ${message.attachments?.length === 1 ? "!w-[70%]" : "!w-[30%]"}`}
                  slides={message.attachments.map((item) => ({
                    src: item.type === "image" ? item.mediaUrl : "",
                  }))}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          ""
        )} */}

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
            // <div
            //   className={`flex w-full gap-[.5rem] laptop:h-[20rem] ${message.contactId === info.id ? "justify-end" : ""}`}
            // >
            //   <ImageWithLightBoxAndNoLazy
            //     src={message.attachments[0].mediaUrl}
            //     title={message.attachments[0].mediaName?.split(".")[0]}
            //     className={`loaded aspect-square cursor-pointer`}
            //     slides={message.attachments.map((item) => ({
            //       src: item.type === "image" ? item.mediaUrl : "",
            //     }))}
            //     index={0}
            //     pending={message.attachments[0].pending}
            //     local={message.attachments[0].local}
            //   />
            //   <div className="flex w-[20%] flex-col justify-between">
            //     <ImageWithLightBoxAndNoLazy
            //       src={message.attachments[1].mediaUrl}
            //       title={message.attachments[1].mediaName?.split(".")[0]}
            //       className={`loaded h-[45%] w-full cursor-pointer`}
            //       slides={message.attachments.map((item) => ({
            //         src: item.type === "image" ? item.mediaUrl : "",
            //       }))}
            //       index={1}
            //       pending={message.attachments[1].pending}
            //       local={message.attachments[1].local}
            //     />
            //     <ImageWithLightBoxAndNoLazy
            //       src={message.attachments[2].mediaUrl}
            //       title={message.attachments[2].mediaName?.split(".")[0]}
            //       className={`loaded h-[45%] w-full cursor-pointer`}
            //       slides={message.attachments.map((item) => ({
            //         src: item.type === "image" ? item.mediaUrl : "",
            //       }))}
            //       index={2}
            //       pending={message.attachments[2].pending}
            //       local={message.attachments[2].local}
            //     />
            //   </div>
            // </div>

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

        {/* Content */}
        {message.content ? (
          <>
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

            {/* Show more message */}
            {isOverflowing && (
              <div
                // className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer text-base text-green-500"
                className="absolute bottom-[-1.2rem] right-[3rem] cursor-pointer text-base text-green-500"
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

        {/* Reaction */}
        <MessageReaction
          message={{
            mine: message.contactId === info.id,
            reaction: reaction,
            topReactions: topReactions,
          }}
          react={react}
          pending={message.pending}
        />
        {/* {!pending ? (
          <MessageReaction
            message={{
              mine: message.contactId === info.id,
              reaction: reaction,
              topReactions: topReactions,
            }}
            react={react}
          />
        ) : (
          ""
        )} */}
      </div>
    </div>
  );
};

export default MessageContent;
