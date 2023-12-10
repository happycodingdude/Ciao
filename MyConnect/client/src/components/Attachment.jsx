import moment from "moment";
import React, { useEffect, useRef, useState } from "react";

const Attachment = ({ func }) => {
  console.log("Attachment calling");

  const refAttachment = useRef();
  const [attachments, setAttachments] = useState();
  const refGrid = useRef();

  const imageOnError = (e) => {
    e.target.onerror = null;
    e.target.src = "../src/assets/imagenotfound.jpg";
  };

  const showAttachment = (attachments) => {
    setAttachments(attachments);
    refAttachment.current.classList.remove("animate-flip-scale-down-vertical");
    refAttachment.current.classList.add("animate-flip-scale-up-vertical");
  };

  const reset = () => {
    refAttachment.current.classList.remove("animate-flip-scale-up-vertical");
    refAttachment.current.classList.remove("animate-flip-scale-down-vertical");
  };

  useEffect(() => {
    func.refAttachment.showAttachment = showAttachment;
    func.refAttachment.reset = reset;
  }, [showAttachment, reset]);

  const hideAttachment = () => {
    refAttachment.current.classList.remove("animate-flip-scale-up-vertical");
    refAttachment.current.classList.add("animate-flip-scale-down-vertical");
  };

  const showInformation = () => {
    func.refAttachment.showInformation();
    hideAttachment();
  };

  return (
    <div
      ref={refAttachment}
      className="hide-scrollbar absolute top-0 h-full w-full overflow-hidden overflow-y-auto scroll-smooth rounded-[1rem] bg-white"
    >
      <div className="flex items-center justify-between border-b-[.1rem] border-b-gray-300 px-[2rem] pt-[1rem] laptop:h-[5.5rem]">
        <div
          className="fa fa-arrow-left flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-[1rem] text-lg font-normal text-gray-500"
          onClick={showInformation}
        ></div>
        <p className="font-bold text-gray-600">Attachments</p>
        <div className="flex items-center gap-[.3rem]">
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
        </div>
      </div>
      <div className="mt-[2rem] flex flex-col [&>*:not(:first-child)]:mt-[2rem] [&>*:not(:last-child)]:border-b-[.5rem] [&>*:not(:last-child)]:border-b-gray-200 [&>*]:px-[2rem] [&>*]:pb-[1rem]">
        {attachments?.map((date) => (
          <div className="flex flex-col gap-[2rem]">
            <div className="font-bold text-gray-600">
              {moment(date.Date).format("DD/MM/YYYY")}
            </div>
            <div
              ref={refGrid}
              className="grid w-full grid-cols-[repeat(3,1fr)] gap-[1rem]"
            >
              {date.Attachments.map((item) => {
                return item.Type === "image" ? (
                  <img
                    src={item.MediaUrl}
                    onError={imageOnError}
                    className="aspect-square cursor-pointer rounded-2xl"
                  ></img>
                ) : (
                  <img
                    src="../src/assets/filenotfound.svg"
                    onError={imageOnError}
                    className="aspect-square cursor-pointer rounded-2xl"
                  ></img>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attachment;
