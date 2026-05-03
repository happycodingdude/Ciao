import { useEffect, useRef, useState } from "react";
import useAttachment from "../../hooks/useAttachment";
import { useAttachmentLimit } from "../../hooks/useAttachmentLimit";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import { AttachmentModel } from "../../types/message.types";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ShareImage from "./ShareImage";

type Props = {
  conversationId: string;
};

const InformationAttachments = ({ conversationId }: Props) => {
  const { setToggle } = useChatDetailToggles();
  const { data: attachmentCache, isLoading } = useAttachment(conversationId);
  const limit = useAttachmentLimit();
  const [displayAttachments, setDisplayAttachments] = useState<AttachmentModel[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Cache chưa load → chờ
    if (!attachmentCache) return;
    if (attachmentCache.attachments.length > 0) {
      // Flatten tất cả bucket ngày → lấy `limit` item đầu tiên để hiển thị preview
      const merged = attachmentCache.attachments.flatMap((item) => item.attachments);
      setDisplayAttachments(merged.slice(0, limit));
    } else {
      // Không có attachment nào → reset về mảng rỗng (hiển thị empty state)
      setDisplayAttachments([]);
    }
  }, [attachmentCache, limit]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <p className="font-medium">Attachments</p>
        <div
          onClick={() => setToggle("attachment")}
          className="cursor-pointer text-light-blue-500 hover:text-light-blue-400"
        >
          View all
        </div>
      </div>
      <div className="laptop:max-h-50 laptop-lg:max-h-40 relative flex items-center justify-center overflow-hidden">
        {/* isLoading → spinner; có attachment → grid ảnh; không có → empty state */}
        {isLoading ? (
          <div className="fa fa-spinner fa-spin my-8 text-xl"></div>
        ) : displayAttachments.length > 0 ? (
          <div className="display-attachment-container laptop:grid-cols-3 laptop-lg:grid-cols-4 desktop:grid-cols-5 grid w-full gap-4">
            {displayAttachments.map((item, index) => (
              <div className="relative" key={index}>
                <ImageWithLightBoxAndNoLazy
                  ref={(el) => (imageRefs.current[index] = el)}
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  className="peer aspect-square w-full"
                  slides={displayAttachments.map((att) => ({
                    // type image → dùng URL thực; file khác → placeholder "not found"
                    src: att.type === "image" ? att.mediaUrl ?? "" : "images/filenotfound.svg",
                  }))}
                  index={index}
                  pending={item.pending}
                  local={item.local}
                />
                <ShareImage
                  media={item}
                  showImage={() => imageRefs.current[index]?.click()}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-size-[100%] bg-position-[center_center] aspect-square w-20 self-center bg-[url('/assets/emptybox.svg')] bg-no-repeat"></div>
        )}
      </div>
    </div>
  );
};

export default InformationAttachments;
