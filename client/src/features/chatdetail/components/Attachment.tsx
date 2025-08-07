import { useParams } from "@tanstack/react-router";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useChatDetailToggles from "../../chatbox/hooks/useChatDetailToggles";
import useAttachment from "../hooks/useAttachment";

const Attachment = () => {
  const { toggle } = useChatDetailToggles();

  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const { data: attachmentCache } = useAttachment(conversationId);

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
      <div className="flex items-center justify-evenly py-[1rem]">
        <div
          className={`${attachmentToggle === "image" ? "selected" : ""}  cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
          onClick={() => {
            toggleAttachmentActive("image");
            setAttachmentToggle("image");
          }}
        >
          Images
        </div>
        <div
          className={`${attachmentToggle === "file" ? "selected" : ""} cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
          onClick={() => {
            toggleAttachmentActive("file");
            setAttachmentToggle("file");
          }}
        >
          Files
        </div>
      </div>

      {/* <div className="relative border-b-[.1rem] border-b-[var(--border-color)]">
        <div className="attachment-filter-container">
          <div
            onClick={() => {
              toggleAttachmentActive("image");
              setAttachmentToggle("image");
            }}
            className={`attachment-filter-item group 
              ${
                attachmentToggle === "image"
                  ? ""
                  : "bg-[var(--bg-color-light)] hover:bg-[var(--main-color-extrathin)]"
              }`}
          >
            <input
              type="radio"
              name="radio-attachment"
              className="attachment-filter-input peer "
              checked={attachmentToggle === "image"}
            ></input>
            <p className="attachment-filter-text peer-checked:text-white">
              Images
            </p>
          </div>
          <div
            onClick={() => {
              toggleAttachmentActive("file");
              setAttachmentToggle("file");
            }}
            className={`attachment-filter-item group 
              ${
                attachmentToggle === "file"
                  ? ""
                  : "bg-[var(--bg-color-light)] hover:bg-[var(--main-color-extrathin)]"
              }`}
          >
            <input
              type="radio"
              name="radio-attachment"
              className="attachment-filter-input peer "
              checked={attachmentToggle === "file"}
            ></input>
            <p className="attachment-filter-text peer-checked:text-white">
              Files
            </p>
          </div>
        </div>
        <div
          data-tab={attachmentToggle}
          className="absolute top-[.5rem] h-[4rem] w-[6rem] rounded-[1rem] bg-[var(--main-color)] transition-all duration-200 
          phone:data-[tab=file]:translate-x-[400%] phone:data-[tab=image]:translate-x-[150%] 
          laptop:data-[tab=file]:translate-x-[225%] laptop:data-[tab=image]:translate-x-[65%]"
        ></div>
      </div> */}

      <div
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

export default Attachment;
