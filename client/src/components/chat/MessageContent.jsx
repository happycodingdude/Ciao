import moment from "moment";
import React from "react";
import { useConversation, useInfo } from "../../hook/CustomHooks";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import MessageReaction from "../common/MessageReaction";

const MessageContent = (props) => {
  console.log("MessageContent calling");
  const { message, pending } = props;

  const { data: info } = useInfo();
  // const { data: messages } = useMessage();
  const { data: conversations } = useConversation();

  const generateMostReaction = () => {
    const reactions = {
      like: message.likeCount,
      love: message.loveCount,
      care: message.careCount,
      wow: message.wowCount,
      sad: message.sadCount,
      angry: message.angryCount,
    };

    return Object.entries(reactions)
      .filter(([_, count]) => count > 0) // Exclude zero counts
      .sort((a, b) => b[1] - a[1]) // Sort by count
      .slice(0, 3) // Get the top 3
      .map(([key]) => key); // Extract reaction names
  };

  return (
    <div
      key={message.id}
      className={`flex shrink-0 gap-[1rem] 
      ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
    >
      {/* Sender avatar */}
      {message.contactId !== info.id ? (
        <div className="relative w-[3rem] self-start">
          {/* {messages.isGroup ? (
            <ImageWithLightBoxAndNoLazy
              className="aspect-square w-full cursor-pointer rounded-[50%] !bg-[size:160%]"
              src={
                messages.participants.find(
                  (q) => q.contact.id === message.contactId,
                ).contact.avatar
              }
              slides={[
                {
                  src: messages.participants.find(
                    (q) => q.contact.id === message.contactId,
                  ).contact.avatar,
                },
              ]}
              // onClick={() => {
              //   setUserId(message.contactId);
              //   setOpen(true);
              // }}
            />
          ) : (
            <ImageWithLightBoxAndNoLazy
              src={
                messages.participants.find((q) => q.contact.id != info.id)
                  .contact.avatar
              }
              className="aspect-square w-full cursor-pointer rounded-[50%] !bg-[size:160%]"
              slides={[
                {
                  src: messages.participants.find(
                    (q) => q.contact.id != info.id,
                  ).contact.avatar,
                },
              ]}
            />
          )} */}
          <ImageWithLightBoxAndNoLazy
            src={
              conversations.selected?.participants.find(
                (q) => q.contact.id === message.contactId,
              )?.contact.avatar
            }
            className="aspect-square w-full cursor-pointer rounded-[50%] !bg-[size:160%]"
            slides={[
              {
                src: conversations.selected?.participants.find(
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
        className={`relative flex flex-col laptop:w-[clamp(60rem,70%,80rem)] desktop:w-[clamp(40rem,70%,80rem)]
        ${message.contactId === info.id ? "items-end" : "items-start"}`}
      >
        {/* Sender infor */}
        <div
          className={`flex items-center gap-[1rem] text-xs text-[var(--text-main-color-thin)]
          ${message.contactId === info.id ? "flex-row-reverse" : ""}`}
        >
          {message.contactId === info.id ? (
            ""
          ) : (
            <p className="">
              {
                conversations.selected?.participants.find(
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
        {/* Content */}
        {message.content ? (
          <div
            className={` break-all rounded-[1rem] ${pending ? "opacity-50" : ""} my-[.5rem] px-[1rem] leading-[5rem]
            ${
              message.contactId === info.id
                ? "rounded-tr-none bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] text-[var(--text-sub-color)]"
                : "rounded-tl-none bg-[var(--bg-color-extrathin)] text-[var(--text-main-color)]"
            }`}
          >
            {message.content}
          </div>
        ) : (
          ""
        )}

        {message.attachments?.length !== 0 ? (
          <div
            className={`flex w-full flex-wrap ${message.contactId === info.id ? "justify-end" : ""} gap-[1rem]`}
          >
            {message.attachments?.map((item, index) => (
              <ImageWithLightBoxAndNoLazy
                src={item.mediaUrl}
                title={item.mediaName?.split(".")[0]}
                className={`aspect-[3/2] ${message.attachments?.length === 1 ? "w-[50%]" : "w-[45%]"} ${pending ? "opacity-50" : ""} cursor-pointer !bg-[size:110%]`}
                slides={message.attachments.map((item) => ({
                  src:
                    item.type === "image"
                      ? item.mediaUrl
                      : "images/filenotfound.svg",
                }))}
                index={index}
              />
            ))}
          </div>
        ) : (
          ""
        )}

        <MessageReaction
          message={{
            mine: message.contactId === info.id,
            totalReaction:
              message.likeCount +
              message.loveCount +
              message.careCount +
              message.wowCount +
              message.sadCount +
              message.angryCount,
            // totalReaction: 0,
            reactions: generateMostReaction(),
            currentReaction: message.currentReaction,
          }}
        />
      </div>
    </div>
  );
};

export default MessageContent;
