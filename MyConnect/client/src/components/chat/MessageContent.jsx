import moment from "moment";
import React from "react";
import { useInfo, useMessage, useParticipant } from "../../hook/CustomHooks";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";

const MessageContent = (props) => {
  console.log("MessageContent calling");
  const { message, pending } = props;

  const { data: info } = useInfo();
  const { data: messages } = useMessage();
  const { data: participants } = useParticipant();

  return (
    <div
      className={`flex items-end gap-[1rem] 
      ${message.contactId === info.data.id ? "flex-row-reverse" : ""}`}
    >
      {/* Sender avatar */}
      {message.contactId !== info.data.id ? (
        <div className="relative w-[3rem]">
          {messages.conversation.isGroup ? (
            <ImageWithLightBoxWithBorderAndShadow
              src={
                participants?.find(
                  (item) => item.contactId == message.contactId,
                )?.contact.avatar ?? ""
              }
              className="aspect-square w-full cursor-pointer self-start rounded-[50%]"
              // onClick={() => {
              //   setUserId(message.contactId);
              //   setOpen(true);
              // }}
            />
          ) : (
            <ImageWithLightBoxWithBorderAndShadow
              src={
                participants?.find((item) => item.contactId !== info.data.id)
                  ?.contact.avatar ?? ""
              }
              className="aspect-square w-full cursor-pointer self-start rounded-[50%]"
              slides={[
                {
                  src:
                    participants?.find(
                      (item) => item.contactId !== info.data.id,
                    )?.contact.avatar ?? "",
                },
              ]}
            />
          )}
        </div>
      ) : (
        ""
      )}
      <div
        className={`flex flex-col gap-[.3rem] laptop:w-[clamp(40rem,70%,50rem)] desktop:w-[clamp(40rem,70%,80rem)] 
        ${message.contactId === info.data.id ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex items-center gap-[1rem] text-xs text-[var(--text-main-color-blur)]
          ${message.contactId === info.data.id ? "flex-row-reverse" : ""}`}
        >
          {message.contactId === info.data.id ? (
            ""
          ) : (
            <p>
              {
                participants?.find(
                  (item) => item.contactId == message.contactId,
                )?.contact.name
              }
            </p>
          )}

          <p>
            {moment(message.createdTime).format("DD/MM/YYYY") ===
            moment().format("DD/MM/YYYY")
              ? moment(message.createdTime).format("HH:mm")
              : moment(message.createdTime).format("DD/MM HH:mm")}
          </p>
        </div>
        {message.type === "text" ? (
          <div
            className={`break-all rounded-[3rem] bg-gradient-radial-to-bc from-[var(--sub-color)] ${pending ? "to-[var(--main-color-normal)]" : "to-[var(--main-color)]"}  
          px-[1.5rem] py-[.7rem] text-[var(--text-sub-color)]`}
          >
            {/* {GenerateContent(participants, message.content)} */}
            {message.content}
          </div>
        ) : (
          <div
            className={`flex w-full flex-wrap ${message.contactId === info.data.id ? "justify-end" : ""} gap-[1rem]`}
          >
            {message.attachments.map((item, index) => (
              <ImageWithLightBox
                src={item.mediaUrl}
                title={item.mediaName?.split(".")[0]}
                className="my-auto aspect-square w-[45%] cursor-pointer rounded-2xl"
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
        )}
      </div>
    </div>
  );
};

export default MessageContent;
