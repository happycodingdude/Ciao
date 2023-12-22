import moment from "moment";
import React, { useEffect, useRef, useState } from "react";

const Attachment = ({ reference }) => {
  console.log("Attachment calling");

  const refAttachment = useRef();
  const refScrollAttachment = useRef();
  const refAttachmentImage = useRef();
  const refAttachmentFile = useRef();
  const [allAttachments, setAllAttachments] = useState();
  const [displayAttachments, setDisplayAttachments] = useState();
  // const refGrid = useRef();

  const imageOnError = (e) => {
    e.target.onerror = null;
    e.target.src = "../src/assets/imagenotfound.jpg";
  };

  const showAttachment = (attachments) => {
    setAllAttachments(attachments);
    setDisplayAttachments(() => {
      const cloned = attachments.map((item) => {
        return Object.assign({}, item);
      });
      return cloned?.map((date) => {
        date.Attachments = date.Attachments.filter(
          (item) => item.Type === "image",
        );
        if (date.Attachments.length !== 0) return date;
      });
    });

    refAttachment.current.classList.remove("animate-flip-scale-down-vertical");
    refAttachment.current.classList.add("animate-flip-scale-up-vertical");
    refScrollAttachment.current.scrollTop = 0;
  };

  const reset = () => {
    refAttachment.current.classList.remove("animate-flip-scale-up-vertical");
    refAttachment.current.classList.remove("animate-flip-scale-down-vertical");
  };

  useEffect(() => {
    reference.refAttachment.showAttachment = showAttachment;
    reference.refAttachment.reset = reset;
  }, [showAttachment, reset]);

  const hideAttachment = () => {
    refAttachment.current.classList.remove("animate-flip-scale-up-vertical");
    refAttachment.current.classList.add("animate-flip-scale-down-vertical");
  };

  const showInformation = () => {
    reference.refInformation.showInformation();
    hideAttachment();
  };

  useEffect(() => {
    reset();
  }, [reference.conversation]);

  const toggleAttachmentActive = (e, type) => {
    if (!e.target.classList.contains("attachment-active")) {
      console.log(type);
      refAttachmentImage.current.classList.toggle("attachment-active");
      refAttachmentFile.current.classList.toggle("attachment-active");

      setDisplayAttachments(() => {
        const cloned = allAttachments.map((item) => {
          return Object.assign({}, item);
        });
        const newAttachments = cloned?.map((date) => {
          date.Attachments = date.Attachments.filter(
            (item) => item.Type === type,
          );
          if (date.Attachments.length !== 0) return date;
        });
        return newAttachments.filter((item) => item !== undefined);
      });
    }
  };

  return (
    <div
      ref={refAttachment}
      className="absolute top-0 flex h-full w-full flex-col rounded-[1rem] bg-white"
    >
      <div className="flex max-h-[5.5rem] basis-full items-center justify-between border-b-[.1rem] border-b-gray-300 px-[2rem] py-[.5rem]">
        <div
          className="fa fa-arrow-left flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-[1rem] text-lg font-normal text-gray-500"
          onClick={showInformation}
        ></div>
        <p className="font-bold text-gray-600">Attachments</p>
        <div className="flex h-1/2 cursor-pointer items-center gap-[.3rem]">
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
        </div>
      </div>
      <div className="flex border-b-[.1rem] border-b-gray-300">
        <div
          ref={refAttachmentImage}
          onClick={(event) => toggleAttachmentActive(event, "image")}
          className="attachment-active relative grow cursor-pointer py-[1rem] text-center font-bold text-gray-600"
        >
          Images
        </div>
        <div
          ref={refAttachmentFile}
          onClick={(event) => toggleAttachmentActive(event, "file")}
          className="relative grow cursor-pointer py-[1rem] text-center font-bold text-gray-600"
        >
          Files
        </div>
      </div>
      <div
        ref={refScrollAttachment}
        className="hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth [&>*:not(:first-child)]:mt-[2rem] [&>*:not(:last-child)]:border-b-[.5rem] [&>*:not(:last-child)]:border-b-gray-200 [&>*]:px-[2rem] [&>*]:pb-[1rem]"
      >
        {displayAttachments?.map((date) => (
          <div className="flex flex-col gap-[2rem]">
            <div className="font-bold text-gray-600">
              {moment(date.Date).format("DD/MM/YYYY")}
            </div>
            <div
              // ref={refGrid}
              className="grid w-full grid-cols-[repeat(3,1fr)] gap-[1rem]"
            >
              {date.Attachments.map((item) => (
                <img
                  src={
                    item.Type === "image"
                      ? item.MediaUrl
                      : "../src/assets/filenotfound.svg"
                  }
                  onError={imageOnError}
                  className="aspect-square w-full cursor-pointer rounded-2xl"
                  title={item.MediaName?.split(".")[0]}
                ></img>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attachment;
