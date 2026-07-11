import { useMemo, useRef } from "react";
import {
  AttachmentTabKind,
  willResetPanelOnConversation,
} from "../../context/ChatDetailTogglesContext";
import useAttachment from "../../hooks/useAttachment";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversationLinks from "../../hooks/useConversationLinks";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import { FileRow, LinkRow, VideoThumb } from "./MediaItems";
import ShareImage from "./ShareImage";

type Props = {
  conversationId: string;
};

// Mỗi section preview tối đa 8 item; phần còn lại xem qua "View all"
// (mở panel Attachment đúng tab tương ứng). Videos/Files/Links cap max-h-40,
// tràn thì scroll trong section để panel Information không bị kéo quá dài.
const MAX_PREVIEW = 8;

// Header section + nút View all — dùng chung cho 4 section.
const SectionHeader = ({
  title,
  tab,
  onViewAll,
}: {
  title: string;
  tab: AttachmentTabKind;
  onViewAll: (tab: AttachmentTabKind) => void;
}) => (
  <div className="flex justify-between">
    <p className="font-medium">{title}</p>
    <div
      onClick={() => onViewAll(tab)}
      className="cursor-pointer text-light-blue-500 hover:text-light-blue-400"
    >
      View all
    </div>
  </div>
);

const EmptyLine = ({ text }: { text: string }) => (
  <p className="text-2xs text-(--text-main-color-blur)">{text}</p>
);

const InformationAttachments = ({ conversationId }: Props) => {
  const { openAttachment, showInformation } = useChatDetailToggles();
  const { data: attachmentCache, isLoading } = useAttachment(conversationId);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Flatten 1 lần rồi partition theo type — không cần effect + setState.
  const { images, videos, files } = useMemo(() => {
    const flat = (attachmentCache?.attachments ?? []).flatMap(
      (item) => item.attachments,
    );
    return {
      images: flat.filter((a) => a.type === "image").slice(0, MAX_PREVIEW),
      videos: flat.filter((a) => a.type === "video").slice(0, MAX_PREVIEW),
      files: flat.filter((a) => a.type === "file").slice(0, MAX_PREVIEW),
    };
  }, [attachmentCache?.attachments]);

  // Links preview: page 1 (limit=8) của endpoint riêng — queryKey khác limit nên
  // không đụng cache panel Attachment (limit=20). Skip fetch khi panel Information
  // đang đóng hoặc vừa đổi conversation (panel sắp bị reset).
  const linksEnabled =
    showInformation && !willResetPanelOnConversation(conversationId);
  const { data: linksData, isLoading: linksLoading } = useConversationLinks(
    conversationId,
    MAX_PREVIEW,
    linksEnabled,
  );
  const links = linksData?.pages[0]?.links ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="fa fa-spinner fa-spin my-8 text-xl"></div>
      </div>
    );
  }

  return (
    <>
      {/* Images */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Images" tab="image" onViewAll={openAttachment} />
        {images.length > 0 ? (
          <div className="display-attachment-container laptop:grid-cols-4 grid w-full gap-4">
            {images.map((item, index) => (
              <div className="relative" key={item.id ?? index}>
                <ImageWithLightBoxAndNoLazy
                  ref={(el) => (imageRefs.current[index] = el)}
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  className="peer aspect-square w-full"
                  slides={images.map((att) => ({ src: att.mediaUrl ?? "" }))}
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
          <EmptyLine text="No images yet" />
        )}
      </div>

      {/* Videos */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Videos" tab="video" onViewAll={openAttachment} />
        {videos.length > 0 ? (
          <div className="hide-scrollbar laptop:grid-cols-4 grid max-h-40 w-full gap-4 overflow-y-auto">
            {videos.map((item, index) => (
              <VideoThumb key={item.id ?? index} item={item} />
            ))}
          </div>
        ) : (
          <EmptyLine text="No videos yet" />
        )}
      </div>

      {/* Files */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Files" tab="file" onViewAll={openAttachment} />
        {files.length > 0 ? (
          <div className="hide-scrollbar flex max-h-40 flex-col overflow-y-auto">
            {files.map((item, index) => (
              <FileRow key={item.id ?? index} item={item} />
            ))}
          </div>
        ) : (
          <EmptyLine text="No files yet" />
        )}
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Links" tab="link" onViewAll={openAttachment} />
        {linksLoading ? (
          <EmptyLine text="Loading..." />
        ) : links.length > 0 ? (
          <div className="hide-scrollbar flex max-h-40 flex-col overflow-y-auto">
            {links.map((link) => (
              <LinkRow key={link.messageId + link.url} item={link} />
            ))}
          </div>
        ) : (
          <EmptyLine text="No links yet" />
        )}
      </div>
    </>
  );
};

export default InformationAttachments;
