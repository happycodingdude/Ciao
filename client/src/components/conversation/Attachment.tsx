import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import {
  AttachmentTabKind,
  willResetPanelOnConversation,
} from "../../context/ChatDetailTogglesContext";
import useAttachment from "../../hooks/useAttachment";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversationLinks from "../../hooks/useConversationLinks";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/button.css";
import { ConversationLinkItem } from "../../types/bookmark.types";
import { AttachmentCache_Attachment } from "../../types/message.types";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import AttachmentIcon from "./AttachmentIcon";
import { FileRow, LinkRow, VideoThumb } from "./MediaItems";
import ShareImage from "./ShareImage";

const TABS: { key: AttachmentTabKind; label: string }[] = [
  { key: "image", label: "Images" },
  { key: "file", label: "Files" },
  { key: "video", label: "Videos" },
  { key: "link", label: "Links" },
];

const EMPTY_TEXT: Record<AttachmentTabKind, string> = {
  image: "Images will appear here",
  file: "Files will appear here",
  video: "Videos will appear here",
  link: "Links will appear here",
};

const Attachment = () => {
  // Tab state nằm ở context để Information preselect được tab qua "View all"
  // (component này luôn mounted, ẩn bằng z-index — xem ChatDetailTogglesContext).
  const { showAttachment, attachmentTab, setAttachmentTab } =
    useChatDetailToggles();

  const { conversationId } = Route.useParams();
  // Chỉ fetch khi panel "View all" đang mở (và không trong lúc vừa đổi conversation — panel
  // sắp reset về Information). Dùng chung query key với InformationAttachments nên nếu bên kia
  // đã warm cache thì mở panel này là có ngay.
  const { data: attachmentCache } = useAttachment(
    conversationId,
    showAttachment && !willResetPanelOnConversation(conversationId),
  );

  // Đóng panel → reset về tab mặc định cho lần mở sau. Chỉ phụ thuộc showAttachment:
  // KHÔNG reset theo attachmentCache (refetch nền sẽ kéo user đang xem Videos/Links
  // về Images) và không clobber preselection từ openAttachment (set tab TRƯỚC khi mở).
  useEffect(() => {
    if (showAttachment) return;
    setAttachmentTab("image");
  }, [showAttachment, setAttachmentTab]);

  // Images/Files/Videos filter client-side trên cache useAttachment (BE trả tất cả,
  // type đã tag lúc upload). Giữ bucket theo ngày, bỏ bucket rỗng sau filter.
  const displayAttachments = useMemo<AttachmentCache_Attachment[]>(() => {
    if (attachmentTab === "link") return [];
    return (attachmentCache?.attachments ?? [])
      .map((date) => ({
        ...date,
        attachments: date.attachments.filter(
          (item) => item.type === attachmentTab,
        ),
      }))
      .filter((date) => date.attachments.length > 0);
  }, [attachmentCache?.attachments, attachmentTab]);

  // Links: endpoint riêng (không phân trang, trả hết), chỉ fetch khi panel mở đúng tab và không
  // trong khoảnh khắc vừa đổi conversation (panel sắp bị reset về Information — fetch là thừa).
  // Dùng chung query key với InformationAttachments nên nếu preview đã warm cache thì mở panel
  // này là có ngay.
  const linksEnabled =
    showAttachment &&
    attachmentTab === "link" &&
    !willResetPanelOnConversation(conversationId);
  const { data: linksData, isLoading: linksLoading } = useConversationLinks(
    conversationId,
    linksEnabled,
  );

  // Nhóm links theo ngày, giữ thứ tự server trả (mới → cũ).
  const linkGroups = useMemo(() => {
    const flat = linksData?.links ?? [];
    const groups: { date: string; links: ConversationLinkItem[] }[] = [];
    for (const link of flat) {
      const date = dayjs(link.createdTime).format("DD/MM/YYYY");
      const last = groups[groups.length - 1];
      if (last && last.date === date) last.links.push(link);
      else groups.push({ date, links: [link] });
    }
    return groups;
  }, [linksData]);

  const isEmpty =
    attachmentTab === "link"
      ? !linksLoading && linkGroups.length === 0
      : displayAttachments.length === 0;

  return (
    <div
      className={`absolute top-0 pb-4 ${showAttachment ? "z-10" : "z-0"} flex h-full w-full flex-col bg-(--bg-color)`}
    >
      <div className="border-b-(--border-color) panel-header-h flex items-center justify-evenly gap-1 border-b-[.1rem] bg-(--bg-color) px-1">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            className={`${attachmentTab === tab.key ? "selected" : ""} custom-button`}
            onClick={() => setAttachmentTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div
          className="m-auto flex animate-wave-ripple flex-col items-center justify-center gap-4"
          style={{ animationDelay: "0.9s" }}
        >
          <AttachmentIcon
            className="pointer-events-none"
            width="2rem"
            height="2rem"
          />
          <p className="text-base text-(--text-main-color-blur)">
            {EMPTY_TEXT[attachmentTab]}
          </p>
        </div>
      ) : attachmentTab === "link" ? (
        <div
          className="hide-scrollbar [&>*:not(:last-child)]:border-b-(--border-color) flex flex-col overflow-hidden overflow-y-auto
        scroll-smooth *:p-4 [&>*:not(:last-child)]:border-b-[.1rem]"
        >
          {linksLoading && (
            <p className="text-(--text-main-color-blur) p-4 text-center">
              Loading...
            </p>
          )}
          {linkGroups.map((group) => (
            <div key={group.date} className="flex flex-col gap-2">
              <div className="text-(--text-main-color-normal)">
                {group.date}
              </div>
              <div className="flex flex-col">
                {group.links.map((link) => (
                  <LinkRow key={link.messageId + link.url} item={link} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="attachment-container hide-scrollbar [&>*:not(:last-child)]:border-b-(--border-color) flex flex-col overflow-hidden overflow-y-auto
        scroll-smooth *:p-4 [&>*:not(:last-child)]:border-b-[.1rem]"
        >
          {displayAttachments.map((date) => (
            <div key={date.date} className="flex flex-col gap-4">
              <div className="text-(--text-main-color-normal)">
                {dayjs(date.date).format("DD/MM/YYYY")}
              </div>
              {attachmentTab === "file" ? (
                <div className="flex flex-col">
                  {date.attachments.map((item, index) => (
                    <FileRow key={item.id ?? index} item={item} />
                  ))}
                </div>
              ) : (
                <div className="grid w-full grid-cols-[repeat(3,1fr)] gap-4">
                  {date.attachments.map((item, index) =>
                    attachmentTab === "video" ? (
                      <VideoThumb key={item.id ?? index} item={item} />
                    ) : (
                      <div key={item.id ?? index} className="relative">
                        <ImageWithLightBoxAndNoLazy
                          src={item.mediaUrl}
                          title={item.mediaName?.split(".")[0]}
                          className="peer aspect-square w-full cursor-pointer rounded-2xl"
                          slides={date.attachments.map((att) => ({
                            src: att.mediaUrl ?? "",
                          }))}
                          index={index}
                          pending={item.pending}
                          local={item.local}
                        />
                        <ShareImage media={item} showImage={() => {}} />
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attachment;
