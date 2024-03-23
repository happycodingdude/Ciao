import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useFetchAttachments,
  useFetchConversations,
} from "../../hook/CustomHooks";
import ImageWithLightBox from "../common/ImageWithLightBox";

const Attachment = (props) => {
  console.log("Attachment calling");
  const { refInformation, refAttachmentExposed } = props;
  const { attachments } = useFetchAttachments();
  const { selected } = useFetchConversations();

  const refAttachment = useRef();
  const refScrollAttachment = useRef();

  const [attachmentToggle, setAttachmentToggle] = useState("image");
  const [displayAttachments, setDisplayAttachments] = useState();

  const showAttachment = () => {
    toggleAttachmentActive("image");
    refAttachment.current.classList.remove("animate-flip-scale-down-vertical");
    refAttachment.current.classList.add("animate-flip-scale-up-vertical");
    refScrollAttachment.current.scrollTop = 0;
  };

  const reset = () => {
    refAttachment.current.classList.remove("animate-flip-scale-up-vertical");
    refAttachment.current.classList.add("animate-flip-scale-down-vertical");
    setAttachmentToggle("image");
  };

  useEffect(() => {
    refAttachmentExposed.showAttachment = showAttachment;
  }, [showAttachment, reset]);

  const hideAttachment = () => {
    refAttachment.current.classList.remove("animate-flip-scale-up-vertical");
    refAttachment.current.classList.add("animate-flip-scale-down-vertical");
    setAttachmentToggle("image");
  };

  const showInformation = () => {
    refInformation.showInformation();
    hideAttachment();
  };

  useEffect(() => {
    reset();
  }, [selected.Id]);

  const toggleAttachmentActive = useCallback(
    (type) => {
      const cloned = attachments.map((item) => {
        return Object.assign({}, item);
      });
      const newAttachments = cloned.map((date) => {
        date.Attachments = date.Attachments.filter(
          (item) => item.Type === type,
        );
        if (date.Attachments.length !== 0) return date;
      });
      setDisplayAttachments(
        newAttachments.filter((item) => item !== undefined),
      );
    },
    [attachments],
  );

  return (
    <div
      ref={refAttachment}
      className="absolute top-0 flex h-full w-full flex-col bg-[var(--bg-color)]"
    >
      <div
        className="relative flex h-[7rem] shrink-0 items-center justify-center border-b-[.1rem] border-b-[var(--border-color)] 
        px-[2rem] py-[.5rem]"
      >
        <div
          className="fa fa-arrow-left absolute left-[5%] flex aspect-square w-[3rem] cursor-pointer items-center justify-center 
          rounded-[1rem] text-lg font-normal"
          onClick={showInformation}
        ></div>
        <p className="font-bold">Attachments</p>
      </div>
      <div className="relative flex">
        <div
          onClick={() => toggleAttachmentActive("image")}
          className="peer relative flex-1 cursor-pointer py-[1rem] text-center font-bold"
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
          className="peer relative flex-1 cursor-pointer py-[1rem] text-center font-bold"
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
        ref={refScrollAttachment}
        className="hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth [&>*:not(:first-child)]:mt-[2rem] 
        [&>*:not(:last-child)]:border-b-[.5rem] [&>*:not(:last-child)]:border-b-[var(--border-color)]  [&>*]:px-[2rem] [&>*]:pb-[1rem]"
      >
        {displayAttachments?.map((date) => (
          <div className="flex flex-col gap-[2rem]">
            <div className="font-bold text-[var(--text-main-color-blur)]">
              {moment(date.Date).format("DD/MM/YYYY")}
            </div>
            <div className="grid w-full grid-cols-[repeat(3,1fr)] gap-[1rem]">
              {date.Attachments.map((item, index) => (
                <ImageWithLightBox
                  src={item.MediaUrl}
                  title={item.MediaName?.split(".")[0]}
                  className="aspect-square w-full cursor-pointer rounded-2xl"
                  slides={date.Attachments.map((item) => ({
                    src:
                      item.Type === "image"
                        ? item.MediaUrl
                        : "../src/assets/filenotfound.svg",
                  }))}
                  index={index}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attachment;
