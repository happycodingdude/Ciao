import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { willResetPanelOnConversation } from "../../context/ChatDetailTogglesContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import { useServerSearchFallback } from "../../hooks/useServerSearchFallback";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { getPinnedMessages } from "../../services/message.service";
import { ConversationModel_Contact } from "../../types/conv.types";
import { formatMessageTime, renderContent } from "../../utils/searchHighlight";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ModalSearchInput from "../common/ModalSearchInput";

// Panel "Tin đã ghim" của hội thoại — UI đồng bộ với InformationSearch/InformationBookmark.
// Luồng dữ liệu:
// 1. Mở panel → load danh sách tin đã ghim (server build sẵn preview theo loại tin).
// 2. Gõ keyword → filter client-side trong list đã load; nếu không match →
//    gọi API search theo keyword (debounce) — đồng bộ logic với InformationBookmark.
// 3. Click 1 tin → nhảy tới tin trong khung chat (cùng cơ chế ?messageId với search).
const InformationPin = () => {
  const { conversationId } = Route.useParams();
  // Đang có jump-to-message chạy dở (?messageId chưa clear) → khoá click item mới.
  const { messageId: pendingJumpId } = Route.useSearch();
  const { showPin } = useChatDetailToggles();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const refInput = useRef<HTMLInputElement>(null);

  // Load qua react-query: dedupe StrictMode, refetch mỗi lần mở lại panel (staleTime 0),
  // và onNewMessagePinned (realtime) chỉ cần invalidate key này để list tự cập nhật.
  const enabled = showPin && !willResetPanelOnConversation(conversationId);
  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ["pinnedMessages", conversationId],
    queryFn: () => getPinnedMessages(conversationId),
    enabled,
  });

  // Component always-mounted (sibling trong ChatboxContainer). Mỗi lần MỞ panel:
  // reset keyword + auto-focus (preventScroll: tránh xê dịch layout khi sidebar
  // đang transition width — cùng lý do với InformationSearch).
  useEffect(() => {
    if (!showPin || willResetPanelOnConversation(conversationId)) return;
    setKeyword("");
    if (refInput.current) refInput.current.value = "";
    refInput.current?.focus({ preventScroll: true });
  }, [showPin, conversationId]);

  const { data: conversations } = useConversation();

  // Map contactId → contact để lookup avatar/name O(1) khi render từng item.
  const contactById = useMemo(() => {
    const map = new Map<string, ConversationModel_Contact>();
    const conv = conversations?.conversations?.find(
      (c) => c.id === conversationId,
    );
    conv?.members?.forEach((m) => {
      if (m.contact?.id) map.set(m.contact.id, m.contact);
    });
    return map;
  }, [conversations, conversationId]);

  const trimmedKeyword = keyword.trim();

  // Filter client-side theo nội dung preview — list ghim của 1 hội thoại nhỏ.
  const localMatches = useMemo(() => {
    if (!trimmedKeyword) return items;
    const kw = trimmedKeyword.toLowerCase();
    return items.filter((m) => m.content?.toLowerCase().includes(kw));
  }, [items, trimmedKeyword]);

  // Local không match → fallback API search theo keyword (debounce + stale guard) —
  // cùng logic với InformationBookmark qua hook dùng chung.
  const { needServerSearch, serverResults, searching } =
    useServerSearchFallback(trimmedKeyword, localMatches.length, (kw) =>
      getPinnedMessages(conversationId, kw),
    );

  const displayed = needServerSearch ? serverResults : localMatches;
  const busy = loading || (needServerSearch && searching);

  // Click 1 tin đã ghim → set ?messageId, Chatbox tự kéo trang cũ tới khi tin xuất hiện
  // rồi scroll + highlight (cùng cơ chế với search tin nhắn). Giữ panel mở.
  // Đang có jump chạy dở → bỏ qua click (data lớn kéo trang lâu, click dồn gây loạn).
  const handleItemClick = (messageId?: string) => {
    if (!messageId || pendingJumpId) return;
    navigate({
      to: "/conversations/$conversationId",
      params: { conversationId },
      search: { messageId },
      replace: true,
    });
  };

  return (
    <div
      className={`absolute top-0 pb-4 ${showPin ? "z-10" : "z-0"} bg-(--bg-color) flex h-full w-full flex-col`}
    >
      {/* Header chỉ tiêu đề — đóng panel bằng cách click lại icon Pushpin trên ChatboxHeaderMenu. */}
      <div className="border-b-(--border-color) panel-header-h bg-(--bg-color) flex items-center border-b-[.1rem] px-4">
        <p className="text-base font-medium">Pinned messages</p>
      </div>

      {/* Ô search — filter live trong list đã load, fallback API khi không match. */}
      <div className="px-4 py-3">
        <ModalSearchInput
          inputRef={refInput}
          placeholder="Filter pinned messages..."
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Danh sách tin đã ghim (tin mới trước) */}
      <div className="hide-scrollbar flex grow flex-col overflow-y-auto">
        {busy && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            {loading ? "Loading..." : "Searching..."}
          </p>
        )}
        {!busy && displayed.length === 0 && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            {trimmedKeyword ? "No matches" : "No pinned messages"}
          </p>
        )}
        {!busy &&
          displayed.map((m) => {
            const sender = m.contactId
              ? contactById.get(m.contactId)
              : undefined;
            return (
              <div
                key={m.id}
                onClick={() => handleItemClick(m.id)}
                className={`border-b-(--border-color) hover:bg-(--bg-color-extrathin) flex items-start gap-3 border-b-[.1rem] px-4 py-3
                  ${pendingJumpId ? "cursor-wait" : "cursor-pointer"}`}
              >
                {/* Avatar người gửi bên trái */}
                <ImageWithLightBoxAndNoLazy
                  src={sender?.avatar}
                  className="aspect-square h-8 shrink-0"
                  circle
                  slides={[{ src: sender?.avatar ?? "" }]}
                  onClick={() => {}}
                />
                <div className="flex min-w-0 grow flex-col gap-1">
                  {/* Hàng trên: tên + thời gian góc phải */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-2xs truncate font-medium">
                      {sender?.name ?? "Unknown"}
                    </p>
                    <p className="text-3xs text-(--text-main-color-blur) shrink-0">
                      {m.createdTime
                        ? formatMessageTime(dayjs(m.createdTime))
                        : ""}
                    </p>
                  </div>
                  <p className="text-2xs wrap-break-word">
                    {renderContent(m.content, trimmedKeyword)}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default InformationPin;
