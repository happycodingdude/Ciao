import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef } from "react";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import useMessage from "../../hooks/useMessage";
import { NotificationModel } from "../../types/base.types";
import { PendingMessageModel } from "../../types/message.types";
import { renderMessageWithMentions } from "../../utils/renderMention";

const FALLBACK_AVATAR = "/assets/imagenotfound.jpg";

// Pane review READ-ONLY: header hội thoại + tin nhắn gần đây + nút mở chat đầy đủ.
// Highlight tin nhắn gốc của notification (sourceMessageId) cho dễ nhìn.
const ConversationReview = ({
  notification,
}: {
  notification: NotificationModel;
}) => {
  const conversationId = notification.sourceId;
  const navigate = useNavigate();
  const { data: info } = useInfo();
  const { data: conversationCache } = useConversation();
  const { data, isLoading } = useMessage(conversationId, 1);

  const selfId = info?.id;
  const selfName = info?.name;
  const conversation = conversationCache?.conversations?.find(
    (c) => c.id === conversationId,
  );
  const otherMember = (conversation?.members ?? []).find(
    (m) => m.contact?.id !== selfId,
  );
  const isGroup = conversation?.isGroup;
  const title = isGroup ? conversation?.title : otherMember?.contact?.name;
  const avatar = isGroup ? conversation?.avatar : otherMember?.contact?.avatar;

  const contactById = useMemo(
    () =>
      new Map(
        (conversation?.members ?? []).map((m) => [m.contact?.id, m.contact]),
      ),
    [conversation],
  );

  // Hiển thị cũ→mới (mới ở dưới).
  const messages = useMemo(
    () =>
      [...(data?.messages ?? [])].sort(
        (a, b) =>
          new Date(a.createdTime ?? 0).getTime() -
          new Date(b.createdTime ?? 0).getTime(),
      ),
    [data],
  );

  // 1 notification = ĐÚNG 1 tin được highlight.
  // - Ưu tiên sourceMessageId (chính xác, bản ghi mới).
  // - Fallback bản ghi cũ (mention): trong các tin mention @[tên mình]/@[All], chọn DUY NHẤT
  //   tin gần thời điểm notification nhất (notification tạo ngay sau tin gốc).
  const highlightId = useMemo<string | undefined>(() => {
    if (notification.sourceMessageId) return notification.sourceMessageId;
    if (notification.sourceType !== "mention") return undefined;

    // "mentioned everyone" → chỉ tin @[All]; "mentioned you" → chỉ tin @[tên mình].
    const isEveryone =
      notification.action === "mentioned everyone" ||
      !!notification.content?.includes("everyone");
    const notiTime = new Date(notification.createdTime ?? 0).getTime();
    const candidates = messages.filter((m) => {
      if (m.type !== "text" || !m.content) return false;
      return isEveryone
        ? m.content.includes("@[All]")
        : !!selfName && m.content.includes(`@[${selfName}]`);
    });
    if (candidates.length === 0) return undefined;

    return candidates.sort(
      (a, b) =>
        Math.abs(new Date(a.createdTime ?? 0).getTime() - notiTime) -
        Math.abs(new Date(b.createdTime ?? 0).getTime() - notiTime),
    )[0].id;
  }, [messages, notification, selfName]);

  const isHighlighted = (m: PendingMessageModel) => m.id === highlightId;
  const firstHighlightId = highlightId;

  // Cuộn tới tin highlight (giữa khung); không có thì cuộn xuống cuối.
  const firstHlRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (firstHlRef.current)
      firstHlRef.current.scrollIntoView({ block: "center" });
    else bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversationId, firstHighlightId]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Header */}
      <div className="border-(--border-color) flex shrink-0 items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            style={{ backgroundImage: `url(${avatar || FALLBACK_AVATAR})` }}
            className="block aspect-square w-9 shrink-0 rounded-full bg-(--bg-color-extrathin) bg-cover bg-center"
          />
          <span className="text-(--text-main-color) truncate font-semibold">
            {title ?? "Conversation"}
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/conversations/$conversationId",
              params: { conversationId },
            })
          }
          className="bg-light-blue-500 hover:bg-light-blue-600 flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-white transition-colors"
        >
          Open in chat
          <i className="fa-solid fa-arrow-right text-xs" />
        </button>
      </div>

      {/* Messages (read-only) */}
      <div className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="text-(--text-main-color-blur) m-auto text-sm">
            Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="text-(--text-main-color-blur) m-auto text-sm">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.contactId === selfId;
            const sender = contactById.get(m.contactId);
            const highlighted = isHighlighted(m);
            const isText = m.type === "text" && !m.recalledTime;
            return (
              <div
                key={m.id}
                ref={m.id === firstHighlightId ? firstHlRef : undefined}
                className={`flex items-end gap-2 px-2 py-1 ${mine ? "flex-row-reverse" : ""}`}
              >
                {!mine && (
                  <span
                    style={{
                      backgroundImage: `url(${sender?.avatar || FALLBACK_AVATAR})`,
                    }}
                    className="block aspect-square w-7 shrink-0 rounded-full bg-(--bg-color-extrathin) bg-cover bg-center"
                  />
                )}
                <div
                  className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  {!mine && isGroup && (
                    <span className="text-(--text-main-color-blur) mb-0.5 px-1 text-xs">
                      {sender?.name}
                    </span>
                  )}
                  {/* Highlight GÓI GỌN trong bong bóng (không tràn full-width). */}
                  <span
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm transition-colors
                      ${
                        mine
                          ? "bg-light-blue-500 text-white"
                          : highlighted
                            ? "bg-amber-200 text-(--text-main-color)"
                            : "bg-(--bg-color-extrathin) text-(--text-main-color)"
                      }
                      ${highlighted ? "ring-2 ring-amber-400" : ""}
                      ${m.recalledTime ? "italic opacity-70" : ""}`}
                  >
                    {m.recalledTime
                      ? "Message was recalled"
                      : isText
                        ? renderMessageWithMentions(m.content ?? "")
                        : messageMedia(m)}
                  </span>
                  <span className="text-(--text-main-color-blur) mt-0.5 px-1 text-[10px]">
                    {dayjs(m.createdTime).format("h:mm A")}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

// Tóm tắt media (không phải text).
const messageMedia = (m: PendingMessageModel): string => {
  const atts = m.attachments ?? [];
  if (atts.length === 0) return "Attachment";
  const images = atts.filter((a) => a.type === "image").length;
  const files = atts.length - images;
  if (files === 0) return images === 1 ? "📷 Photo" : `📷 ${images} photos`;
  if (images === 0) return files === 1 ? "📎 File" : `📎 ${files} files`;
  return `📎 ${atts.length} attachments`;
};

export default ConversationReview;
