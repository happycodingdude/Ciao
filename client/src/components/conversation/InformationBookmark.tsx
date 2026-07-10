import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { willResetPanelOnConversation } from "../../context/ChatDetailTogglesContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { getConversationBookmarks } from "../../services/bookmark.service";
import { BookmarkItemModel } from "../../types/bookmark.types";
import {
  formatMessageTime,
  renderContent,
} from "../../utils/searchHighlight";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ModalSearchInput from "../common/ModalSearchInput";

// Panel "Tin nhắn đã lưu" của hội thoại — UI đồng bộ với InformationSearch.
// Luồng dữ liệu:
// 1. Mở panel → load toàn bộ tin đã lưu của hội thoại (không keyword).
// 2. Gõ keyword → filter client-side trong list đã load; nếu không match →
//    gọi API search theo keyword (debounce) để tìm phía server.
// 3. Clear ô search → hiển thị lại list đã load ở bước 1.
const InformationBookmark = () => {
  const { conversationId } = Route.useParams();
  const { showBookmark } = useChatDetailToggles();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  // Kết quả API search theo keyword — chỉ dùng khi local filter không match.
  const [serverResults, setServerResults] = useState<BookmarkItemModel[]>([]);
  const [searching, setSearching] = useState(false);

  const refInput = useRef<HTMLInputElement>(null);
  // Đánh dấu request search mới nhất — response cũ về muộn sẽ bị bỏ qua (stale guard).
  const refSearchSeq = useRef(0);
  const refDebounce = useRef<ReturnType<typeof setTimeout>>();

  // Load danh sách qua react-query thay vì fetch thủ công trong effect:
  // - StrictMode (dev) mount effect 2 lần → fetch thủ công bắn 2 request; react-query
  //   dedupe request đang in-flight nên mạng chỉ có 1 call.
  // - enabled gate 2 điều kiện: panel đang mở, và KHÔNG trong khoảnh khắc vừa đổi
  //   conversation (ChatboxContainer sắp reset panel về Information — fetch lúc đó là thừa).
  // - staleTime mặc định 0 → mỗi lần enabled flip false→true (user mở panel) đều refetch
  //   cho dữ liệu mới; khi có cache cũ thì hiển thị ngay rồi refresh ngầm.
  const enabled = showBookmark && !willResetPanelOnConversation(conversationId);
  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ["conversationBookmarks", conversationId],
    queryFn: () => getConversationBookmarks(conversationId),
    enabled,
  });

  // Component always-mounted (sibling trong ChatboxContainer). Mỗi lần MỞ panel:
  // reset keyword + auto-focus (preventScroll: tránh xê dịch layout khi sidebar
  // đang transition width — cùng lý do với InformationSearch).
  useEffect(() => {
    if (!showBookmark || willResetPanelOnConversation(conversationId)) return;
    setKeyword("");
    setServerResults([]);
    if (refInput.current) refInput.current.value = "";
    refInput.current?.focus({ preventScroll: true });
  }, [showBookmark, conversationId]);

  const trimmedKeyword = keyword.trim();

  // Filter client-side trong list đã load (case-insensitive, theo nội dung tin).
  const localMatches = useMemo(() => {
    if (!trimmedKeyword) return items;
    const kw = trimmedKeyword.toLowerCase();
    return items.filter((m) => m.content?.toLowerCase().includes(kw));
  }, [items, trimmedKeyword]);

  // Local không match → fallback gọi API search theo keyword (debounce 400ms).
  const needServerSearch = !!trimmedKeyword && localMatches.length === 0;
  useEffect(() => {
    clearTimeout(refDebounce.current);
    if (!needServerSearch) {
      setServerResults([]);
      setSearching(false);
      return;
    }
    const seq = ++refSearchSeq.current;
    setSearching(true);
    refDebounce.current = setTimeout(() => {
      getConversationBookmarks(conversationId, trimmedKeyword)
        .then((data) => {
          if (seq === refSearchSeq.current) setServerResults(data ?? []);
        })
        .finally(() => {
          if (seq === refSearchSeq.current) setSearching(false);
        });
    }, 400);
    return () => clearTimeout(refDebounce.current);
  }, [needServerSearch, trimmedKeyword, conversationId]);

  const displayed = needServerSearch ? serverResults : localMatches;
  const busy = loading || (needServerSearch && searching);

  // Click 1 tin đã lưu → set ?messageId, Chatbox tự kéo trang cũ tới khi tin xuất hiện
  // rồi scroll + highlight (cùng cơ chế với search tin nhắn). Giữ panel mở.
  const handleItemClick = (m: BookmarkItemModel) => {
    if (!m.messageId || m.isUnavailable) return;
    navigate({
      to: "/conversations/$conversationId",
      params: { conversationId },
      search: { messageId: m.messageId },
      replace: true,
    });
  };

  return (
    <div
      className={`absolute top-0 pb-4 ${showBookmark ? "z-10" : "z-0"} bg-(--bg-color) flex h-full w-full flex-col`}
    >
      {/* Header chỉ tiêu đề — đóng panel bằng cách click lại icon Bookmark trên ChatboxHeaderMenu. */}
      <div className="border-b-(--border-color) panel-header-h bg-(--bg-color) flex items-center border-b-[.1rem] px-4">
        <p className="text-base font-medium">Saved messages</p>
      </div>

      {/* Ô search — filter live trong list đã load, fallback API khi không match. */}
      <div className="px-4 py-3">
        <ModalSearchInput
          inputRef={refInput}
          placeholder="Filter saved messages..."
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Danh sách tin đã lưu (mới lưu trước) */}
      <div className="hide-scrollbar flex grow flex-col overflow-y-auto">
        {busy && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            {loading ? "Loading..." : "Searching..."}
          </p>
        )}
        {!busy && displayed.length === 0 && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            {trimmedKeyword ? "No matches" : "No saved messages"}
          </p>
        )}
        {!busy &&
          displayed.map((m) => (
            <div
              key={m.id}
              onClick={() => handleItemClick(m)}
              className={`border-b-(--border-color) flex items-start gap-3 border-b-[.1rem] px-4 py-3
                ${m.isUnavailable ? "opacity-60" : "hover:bg-(--bg-color-extrathin) cursor-pointer"}`}
            >
              {/* Avatar người gửi bên trái */}
              <ImageWithLightBoxAndNoLazy
                src={m.senderAvatar ?? undefined}
                className="aspect-square h-8 shrink-0"
                circle
                slides={[{ src: m.senderAvatar ?? "" }]}
                onClick={() => {}}
              />
              <div className="flex min-w-0 grow flex-col gap-1">
                {/* Hàng trên: tên + thời gian góc phải */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-2xs truncate font-medium">
                    {m.senderName || "Unknown"}
                  </p>
                  <p className="text-3xs text-(--text-main-color-blur) shrink-0">
                    {m.messageCreatedTime
                      ? formatMessageTime(dayjs(m.messageCreatedTime))
                      : ""}
                  </p>
                </div>
                <p className="text-2xs wrap-break-word">
                  {m.isUnavailable ? (
                    <span className="italic">Message unavailable</span>
                  ) : (
                    renderContent(m.content, trimmedKeyword)
                  )}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default InformationBookmark;
