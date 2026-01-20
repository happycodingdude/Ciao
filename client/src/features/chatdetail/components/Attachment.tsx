import { useParams } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import "../../../button.css";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useChatDetailToggles from "../../chatbox/hooks/useChatDetailToggles";
import useAttachment from "../hooks/useAttachment";
import AttachmentIcon from "./AttachmentIcon";
import ShareImage from "./ShareImage";

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
      className={`absolute top-0 pb-4 ${toggle === "attachment" ? "z-10" : "z-0"} flex h-full w-full flex-col bg-white`}
    >
      <div className="border-b-(--border-color) flex items-center justify-evenly border-b-[.1rem] py-4">
        <div
          className={`${attachmentToggle === "image" ? "selected" : ""} custom-button`}
          onClick={() => {
            toggleAttachmentActive("image");
            setAttachmentToggle("image");
          }}
        >
          Images
        </div>
        <div
          className={`${attachmentToggle === "file" ? "selected" : ""} custom-button`}
          onClick={() => {
            toggleAttachmentActive("file");
            setAttachmentToggle("file");
          }}
        >
          Files
        </div>
      </div>

      {displayAttachments.length > 0 ? (
        <div
          className="attachment-container hide-scrollbar [&>*:not(:last-child)]:border-b-(--border-color) flex flex-col overflow-hidden overflow-y-auto 
        scroll-smooth *:p-4 [&>*:not(:last-child)]:border-b-[.1rem]"
        >
          {displayAttachments.map((date) => (
            <div className="flex flex-col gap-4">
              <div className="text-(--text-main-color-normal)">
                {dayjs(date.date).format("DD/MM/YYYY")}
              </div>
              <div className="grid w-full grid-cols-[repeat(3,1fr)] gap-4">
                {date.attachments.map((item, index) => (
                  <div className="relative">
                    <ImageWithLightBoxAndNoLazy
                      src={item.mediaUrl}
                      title={item.mediaName?.split(".")[0]}
                      className="peer aspect-square w-full cursor-pointer rounded-2xl"
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
                    <ShareImage media={item} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="m-auto flex animate-wave-ripple flex-col items-center justify-center gap-4"
          style={{ animationDelay: "0.9s" }}
        >
          <AttachmentIcon
            className="pointer-events-none"
            width="2rem"
            height="2rem"
          />
          <p className="text-base text-gray-700">
            Attachments will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default Attachment;
