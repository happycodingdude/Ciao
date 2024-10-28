import moment from "moment";
import React from "react";
import { useInfo, useMessage } from "../../hook/CustomHooks";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

const MessageContent = (props) => {
  console.log("MessageContent calling");
  const { message, pending } = props;

  const { data: info } = useInfo();
  const { data: messages } = useMessage();

  return (
    <div
      key={message.id}
      className={`flex items-end gap-[1rem] 
      ${message.contactId === info.data.id ? "flex-row-reverse" : ""}`}
    >
      {/* Sender avatar */}
      {message.contactId !== info.data.id ? (
        <div className="relative w-[3rem]">
          {messages.isGroup ? (
            <ImageWithLightBoxAndNoLazy
              src={
                messages.participants.find(
                  (q) => q.contact.id === message.contactId,
                ).contact.avatar
              }
              // className="aspect-square w-full cursor-pointer self-start rounded-[50%]"
              className="aspect-square w-full cursor-pointer rounded-[50%]"
              // onClick={() => {
              //   setUserId(message.contactId);
              //   setOpen(true);
              // }}
            />
          ) : (
            <ImageWithLightBoxAndNoLazy
              src={
                messages.participants.find((q) => q.contact.id != info.data.id)
                  .contact.avatar
              }
              // className="aspect-square w-full cursor-pointer self-start rounded-[50%]"
              className="aspect-square w-full cursor-pointer rounded-[50%]"
              slides={[
                {
                  src: messages.participants.find(
                    (q) => q.contact.id != info.data.id,
                  ).contact.avatar,
                },
              ]}
            />
          )}
        </div>
      ) : (
        ""
      )}
      <div
        className={`flex flex-col gap-[.3rem] laptop:w-[clamp(60rem,70%,80rem)] desktop:w-[clamp(40rem,70%,80rem)] 
        ${message.contactId === info.data.id ? "items-end" : "items-start"}`}
      >
        {/* Sender infor */}
        <div
          className={`flex items-center gap-[1rem] text-xs text-[var(--text-main-color-thin)]
          ${message.contactId === info.data.id ? "flex-row-reverse" : ""}`}
        >
          {message.contactId === info.data.id ? (
            ""
          ) : (
            <p className="text-[var(--main-color-thin)]">
              {
                messages.participants.find((q) => q.contact.id != info.data.id)
                  .contact.name
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
        {/* Content */}
        {/* {message.type === "text" ? (
          <div
            className={`break-all rounded-[3rem] ${pending ? "opacity-50" : ""} `}
          >
            {message.content}
          </div>
        ) : (
          <div
            className={`flex w-full flex-wrap ${message.contactId === info.data.id ? "justify-end" : ""} gap-[1rem]`}
          >
            {message.attachments?.map((item, index) => (
              <ImageWithLightBoxAndNoLazy
                src={item.mediaUrl}
                title={item.mediaName?.split(".")[0]}
                className={`aspect-[3/2] ${message.attachments?.length === 1 ? "w-[50%]" : "w-[45%]"} ${pending ? "opacity-50" : ""} cursor-pointer bg-[size:100%]`}
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
        )} */}
        {message.content ? (
          <div
            className={`break-all rounded-[1.2rem] ${pending ? "opacity-50" : ""} px-[1rem] leading-[4rem] 
            ${
              message.contactId === info.data.id
                ? "rounded-tr-none bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] text-[var(--text-sub-color)]"
                : "rounded-bl-none bg-[var(--bg-color-extrathin)] text-[var(--text-main-color)]"
            }`}
          >
            {message.content}
          </div>
        ) : (
          ""
        )}

        {message.attachments ? (
          <div
            className={`flex w-full flex-wrap ${message.contactId === info.data.id ? "justify-end" : ""} gap-[1rem]`}
          >
            {message.attachments?.map((item, index) => (
              <ImageWithLightBoxAndNoLazy
                src={item.mediaUrl}
                title={item.mediaName?.split(".")[0]}
                className={`aspect-[3/2] ${message.attachments?.length === 1 ? "w-[50%]" : "w-[45%]"} ${pending ? "opacity-50" : ""} cursor-pointer bg-[size:100%]`}
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
      </div>
    </div>
  );
};

export default MessageContent;
