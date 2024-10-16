import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImageOLD } from "../../common/Utility";
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
    // refAttachment.current.classList.remove("animate-flip-scale-down-vertical");
    // refAttachment.current.classList.add("animate-flip-scale-up-vertical");
    setAttachmentToggle("image");
  }, [attachments]);

  useEffect(() => {
    if (show) blurImageOLD(".attachment-container");
    // setTimeout(() => {
    //   refScrollAttachment.current.scrollTop = 0;
    // }, 1000);
  }, [displayAttachments, show]);

  return (
    <div
      ref={refAttachment}
      className={`absolute top-0 ${show ? "z-10" : "z-0"} flex h-full w-full flex-col bg-[var(--bg-color-light)]`}
    >
      <div
        className="relative flex shrink-0 items-center justify-center border-b-[.1rem] border-b-[var(--text-main-color-light)] px-[2rem] 
        py-[.5rem] text-[var(--text-main-color-normal)] laptop:h-[5rem]"
      >
        <div
          className="fa fa-arrow-left absolute left-[5%] flex aspect-square w-[3rem] cursor-pointer items-center justify-center 
          rounded-[1rem] text-lg font-normal"
          onClick={toggle}
        ></div>
        <p className="text-[var(--text-main-color)]">Attachments</p>
      </div>
      <div className="relative flex">
        <div
          onClick={() => toggleAttachmentActive("image")}
          className="peer relative flex-1 cursor-pointer py-[1rem] text-center"
        >
          Images
          <input
            type="radio"
            name="radio-attachment"
            className="image-checked absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            onChange={() => setAttachmentToggle("image")}
            checked={attachmentToggle === "image"}
          ></input>
        </div>
        <div
          onClick={() => toggleAttachmentActive("file")}
          className="peer relative flex-1 cursor-pointer py-[1rem] text-center"
        >
          Files
          <input
            type="radio"
            name="radio-attachment"
            className="file-checked absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            onChange={() => setAttachmentToggle("file")}
            checked={attachmentToggle === "file"}
          ></input>
        </div>
        <div
          data-tab={attachmentToggle}
          className="absolute bottom-0 mx-[1rem] h-[.2rem] w-[calc(50%-2rem)] bg-[var(--main-color)] transition-all duration-200 
          data-[tab=file]:translate-x-[calc(100%+2rem)] data-[tab=image]:translate-x-0"
        ></div>
      </div>
      <div
        // ref={refScrollAttachment}
        className="attachment-container hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth [&>*:not(:first-child)]:mt-[2rem] 
        [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--text-main-color-light)]  [&>*]:px-[2rem] [&>*]:pb-[1rem]"
      >
        {show
          ? displayAttachments.map((date) => (
              <div className="flex flex-col gap-[2rem]">
                <div className="text-[var(--text-main-color)] text-[var(--text-main-color-normal)]">
                  {moment(date.date).format("DD/MM/YYYY")}
                </div>
                <div className="grid w-full grid-cols-[repeat(3,1fr)] gap-[1rem]">
                  {date.attachments.map((item, index) => (
                    <ImageWithLightBox
                      src={item.mediaUrl}
                      title={item.mediaName?.split(".")[0]}
                      className="aspect-square w-full cursor-pointer rounded-2xl bg-[size:200%]"
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
