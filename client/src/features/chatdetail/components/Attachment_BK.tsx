import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useChatDetailToggles from "../../chatbox/hooks/useChatDetailToggles";
import useAttachment from "../hooks/useAttachment";

const Attachment_BK = () => {
  // console.log("Attachment calling");
  // const { show, toggle } = props;
  const { toggle } = useChatDetailToggles();
  // const show = toggle === "attachment";
  const { data: attachmentCache } = useAttachment();

  const refAttachment = useRef();
  // const refScrollAttachment = useRef();

  const [attachmentToggle, setAttachmentToggle] = useState("image");
  const [displayAttachments, setDisplayAttachments] = useState([]);

  const toggleAttachmentActive = useCallback(
    (type) => {
      const cloned = attachmentCache.attachments.map((item) => {
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
    [attachmentCache?.attachments],
  );

  useEffect(() => {
    if (!attachmentCache) return;
    toggleAttachmentActive("image");
    setAttachmentToggle("image");
  }, [attachmentCache]);

  useEffect(() => {
    if (toggle === "attachment") return;
    setAttachmentToggle("image");
  }, [toggle]);

  return (
    <div
      ref={refAttachment}
      className={`absolute top-0 pb-4 ${toggle === "attachment" ? "z-10" : "z-0"} flex h-full w-full flex-col bg-[var(--bg-color)]`}
    >
      <div className="relative border-b-[.1rem] border-b-[var(--border-color)]">
        <div className="flex justify-evenly">
          <div
            onClick={() => {
              toggleAttachmentActive("image");
              setAttachmentToggle("image");
            }}
            className="group relative cursor-pointer py-[1rem] text-center text-[var(--text-main-color)] laptop:flex-1"
          >
            <input
              type="radio"
              name="radio-attachment"
              className="peer absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
              checked={attachmentToggle === "image"}
            ></input>
            <p className="font-bold group-hover:text-[var(--main-color-bold)] peer-checked:text-[var(--main-color)]">
              Images
            </p>
          </div>
          <div
            onClick={() => {
              toggleAttachmentActive("file");
              setAttachmentToggle("file");
            }}
            className="group relative cursor-pointer py-[1rem] text-center text-[var(--text-main-color)] laptop:flex-1"
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
        </div>
        <div
          data-tab={attachmentToggle}
          className="absolute bottom-0 h-[.2rem] w-1/4 bg-[var(--main-color)] transition-all duration-200 
          phone:data-[tab=file]:translate-x-[225%] phone:data-[tab=image]:translate-x-[75%]
          laptop:data-[tab=file]:translate-x-[250%] laptop:data-[tab=image]:translate-x-[50%]"
        ></div>
      </div>

      <div
        // ref={refScrollAttachment}
        className="attachment-container hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth [&>*:not(:first-child)]:mt-[2rem] 
        [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--border-color)]  [&>*]:px-[2rem] [&>*]:pb-[1rem]"
      >
        {toggle === "attachment"
          ? displayAttachments.map((date) => (
              <div className="flex flex-col gap-[2rem]">
                <div className="text-[var(--text-main-color-normal)]">
                  {moment(date.date).format("DD/MM/YYYY")}
                </div>
                <div className="grid w-full grid-cols-[repeat(3,1fr)] gap-[1rem]">
                  {date.attachments.map((item, index) => (
                    <ImageWithLightBoxAndNoLazy
                      src={item.mediaUrl}
                      title={item.mediaName?.split(".")[0]}
                      className="aspect-square w-full cursor-pointer rounded-2xl"
                      // spinnerClassName="laptop:bg-[size:2rem]"
                      // imageClassName="bg-[size:150%]"
                      slides={date.attachments.map((item) => ({
                        src:
                          item.type === "image"
                            ? item.mediaUrl
                            : "images/filenotfound.svg",
                      }))}
                      index={index}
                      pending={item.pending}
                      local={item.local}
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

export default Attachment_BK;
