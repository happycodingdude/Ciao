import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImage } from "../../common/Utility";
import { useAttachment } from "../../hook/CustomHooks";
import ImageWithLightBox from "../common/ImageWithLightBox";

const Attachment = (props) => {
  console.log("Attachment calling");
  const { show, toggle } = props;
  const { data: attachments } = useAttachment();

  const refAttachment = useRef();
  // const refScrollAttachment = useRef();

  const [attachmentToggle, setAttachmentToggle] = useState("image");
  const [displayAttachments, setDisplayAttachments] = useState([]);

  const toggleAttachmentActive = useCallback(
    (type) => {
      const cloned = attachments.map((item) => {
        return Object.assign({}, item);
      });
      const newAttachments = cloned.map((date) => {
        date.attachments = date.attachments.filter(
          (item) => item.type === type,
        );
        if (date.attachments.length !== 0) return date;
      });
      setDisplayAttachments(
        newAttachments.filter((item) => item !== undefined),
      );
    },
    [attachments],
  );

  useEffect(() => {
    if (!attachments) return;
    toggleAttachmentActive("image");
    setAttachmentToggle("image");
  }, [attachments]);

  useEffect(() => {
    if (show) blurImage(".attachment-container");
  }, [displayAttachments, show]);

  return (
    <div
      ref={refAttachment}
      className={`absolute top-0 pb-4 ${show ? "z-10" : "z-0"} flex h-full w-full flex-col bg-[var(--bg-color)]`}
    >
      <div className="relative flex border-b-[.1rem] border-b-[var(--border-color)]">
        <div
          onClick={() => {
            toggleAttachmentActive("image");
            setAttachmentToggle("image");
          }}
          className="group relative flex-1 cursor-pointer py-[1rem] text-center text-[var(--text-main-color)]"
        >
          <input
            type="radio"
            name="radio-attachment"
            className="peer absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            checked={attachmentToggle === "image"}
          ></input>
          <p className="group-hover:text-[var(--main-color-bold)] peer-checked:text-[var(--main-color-bold)]">
            Images
          </p>
        </div>
        <div
          onClick={() => {
            toggleAttachmentActive("file");
            setAttachmentToggle("file");
          }}
          className="group relative flex-1 cursor-pointer py-[1rem] text-center text-[var(--text-main-color)]"
        >
          <input
            type="radio"
            name="radio-attachment"
            className="peer absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            checked={attachmentToggle === "file"}
          ></input>
          <p className="group-hover:text-[var(--main-color-bold)] peer-checked:text-[var(--main-color-bold)]">
            Files
          </p>
        </div>
        <div
          data-tab={attachmentToggle}
          className="absolute bottom-0 h-[.2rem] bg-[var(--main-color)] transition-all duration-200 data-[tab=file]:translate-x-[12.5rem] data-[tab=image]:translate-x-0 laptop:w-[12.5rem]"
        ></div>
      </div>

      <div
        // ref={refScrollAttachment}
        className="attachment-container hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth [&>*:not(:first-child)]:mt-[2rem] 
        [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--border-color)]  [&>*]:px-[2rem] [&>*]:pb-[1rem]"
      >
        {show
          ? displayAttachments.map((date) => (
              <div className="flex flex-col gap-[2rem]">
                <div className="text-[var(--text-main-color-normal)]">
                  {moment(date.date).format("DD/MM/YYYY")}
                </div>
                <div className="grid w-full grid-cols-[repeat(3,1fr)] gap-[1rem]">
                  {date.attachments.map((item, index) => (
                    <ImageWithLightBox
                      src={item.mediaUrl}
                      title={item.mediaName?.split(".")[0]}
                      className="aspect-square w-full cursor-pointer rounded-2xl"
                      spinnerClassName="laptop:bg-[size:2rem]"
                      imageClassName="bg-[size:150%]"
                      slides={date.attachments.map((item) => ({
                        src:
                          item.type === "image"
                            ? item.mediaUrl
                            : "images/filenotfound.svg",
                      }))}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))
          : ""}
      </div>
    </div>
  );
};

export default Attachment;
