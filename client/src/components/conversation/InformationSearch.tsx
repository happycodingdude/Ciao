import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { searchMessages } from "../../services/message.service";
import { ConversationModel_Contact } from "../../types/conv.types";
import { MessageSearchResult } from "../../types/message.types";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ModalSearchInput from "../common/ModalSearchInput";

// Escape user input trước khi đưa vào RegExp để tránh ký tự đặc biệt phá pattern.
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Tách text thành các đoạn matched / unmatched theo keyword (case-insensitive),
// trả về array React node để render <mark> cho phần matched.
// Dùng split với capturing group: kết quả xen kẽ unmatched - matched - unmatched - ...
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword) return text;
  const re = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
  const lowerKw = keyword.toLowerCase();
  return text.split(re).map((part, idx) =>
    part.toLowerCase() === lowerKw ? (
      <mark key={idx} className="rounded bg-yellow-200 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    ),
  );
};

// Render nội dung kết quả: vừa hiển thị mention @[name] đúng style (xanh, bỏ ký tự @[]) đồng bộ
// với MessageItem/ConversationItem, vừa highlight keyword — kể cả khi keyword nằm trong tên mention.
const renderContent = (text: string, keyword: string): ReactNode => {
  const mentionRegex = /@\[([^\]]+)\]/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let seg = 0;
  while ((match = mentionRegex.exec(text)) !== null) {
    // Đoạn text thường trước mention → highlight keyword bình thường.
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`t${seg++}`}>
          {highlightKeyword(text.substring(lastIndex, match.index), keyword)}
        </span>,
      );
    }
    // Mention: tên hiển thị màu xanh (bỏ @[]) + vẫn highlight keyword bên trong tên.
    nodes.push(
      <span key={`m${seg++}`} className="text-light-blue-600">
        {highlightKeyword(match[1], keyword)}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  // Đoạn text còn lại sau mention cuối.
  if (lastIndex < text.length) {
    nodes.push(
      <span key={`t${seg++}`}>
        {highlightKeyword(text.substring(lastIndex), keyword)}
      </span>,
    );
  }
  return nodes.length > 0 ? nodes : highlightKeyword(text, keyword);
};

// Sinh nhãn tháng cho separator: This month / Last month / MMMM / MMMM YYYY.
// So sánh theo startOf("month") để chỉ tính theo tháng, không bị ảnh hưởng bởi ngày/giờ.
const formatMonthLabel = (date: dayjs.Dayjs) => {
  const now = dayjs();
  const currentMonth = now.startOf("month");
  const target = date.startOf("month");
  const diffMonths = currentMonth.diff(target, "month");
  if (diffMonths === 0) return "This month";
  if (diffMonths === 1) return "Last month";
  // Cùng năm → chỉ tên tháng; khác năm → kèm năm để tránh ambiguous.
  return target.year() === now.year()
    ? target.format("MMMM")
    : target.format("MMMM YYYY");
};

// Hiển thị thời gian từng message: trong hôm nay → giờ; khác → ngày/tháng.
// Mục đích: tin gần thì user quan tâm "lúc nào trong ngày", tin cũ thì quan tâm "ngày nào".
const formatMessageTime = (date: dayjs.Dayjs) => {
  const isToday = date.startOf("day").isSame(dayjs().startOf("day"));
  return isToday ? date.format("HH:mm") : date.format("DD/MM");
};

type MonthGroup = {
  key: string;
  label: string;
  items: MessageSearchResult[];
};

const InformationSearch = () => {
  // Component tự túc: đọc conversationId từ route. Việc đóng panel do user toggle icon Search
  // ở ChatboxHeaderMenu (không có nút back trong panel này).
  const { conversationId } = Route.useParams();
  const { showSearch } = useChatDetailToggles();
  const navigate = useNavigate();

  // Click 1 kết quả → set ?messageId, Chatbox tự kéo trang cũ (nếu cần) tới khi tin xuất hiện
  // rồi scroll + highlight. GIỮ panel search mở (không đóng) để user click tiếp kết quả khác —
  // panel chỉ phủ sidebar phải, khung chat vẫn hiển thị nên vẫn thấy tin nhảy tới.
  const handleResultClick = (messageId?: string) => {
    if (!messageId) return;
    navigate({
      to: "/conversations/$conversationId",
      params: { conversationId },
      search: { messageId },
      replace: true,
    });
  };

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  // Snapshot keyword tại thời điểm search thành công — dùng cho highlight.
  // KHÔNG dùng state `keyword` trực tiếp vì user có thể gõ tiếp sau khi đã search,
  // gây highlight lệch với kết quả đang hiển thị.
  const [searchedKeyword, setSearchedKeyword] = useState("");

  // ModalSearchInput không có prop autoFocus; focus thủ công qua ref khi mở panel.
  const refInput = useRef<HTMLInputElement>(null);

  // Reset toàn bộ trạng thái search về rỗng (ô input uncontrolled → clear value trực tiếp).
  const resetSearch = () => {
    setKeyword("");
    setResults([]);
    setSearched(false);
    setSearchedKeyword("");
    if (refInput.current) refInput.current.value = "";
  };

  // Component giờ always-mounted (render sibling, không còn `showSearch && <...>` ở parent).
  // → mỗi lần user MỞ Search panel: clear ô input + list cũ rồi auto-focus (yêu cầu #3 — vào lại
  //   không thấy kết quả/keyword của lần trước).
  // `preventScroll: true` BẮT BUỘC: khi panel mở, sidebar đang transition w-0 → sidebar-w,
  // focus() mặc định trigger browser scroll-into-view trên ancestor scrollable → chat list +
  // chatbox bị xê dịch 1 thoáng. Information/Attachment không focus input nên không gặp.
  useEffect(() => {
    if (showSearch) {
      resetSearch();
      refInput.current?.focus({ preventScroll: true });
    }
  }, [showSearch]);

  const { data: conversations } = useConversation();

  // Map contactId → contact để lookup avatar/name O(1) khi render từng kết quả.
  // useMemo theo (conversations, conversationId) để không build lại mỗi lần gõ keyword.
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

  // Gom kết quả theo tháng, giữ nguyên thứ tự server trả về (mới → cũ thông thường).
  // Key dùng YYYY-MM để stable; label dùng formatMonthLabel cho UI.
  const groupedResults = useMemo<MonthGroup[]>(() => {
    const groups: MonthGroup[] = [];
    let current: MonthGroup | null = null;
    for (const m of results) {
      const d = m.createdTime ? dayjs(m.createdTime) : null;
      const key = d ? d.format("YYYY-MM") : "unknown";
      if (!current || current.key !== key) {
        current = {
          key,
          label: d ? formatMonthLabel(d) : "Unknown",
          items: [],
        };
        groups.push(current);
      }
      current.items.push(m);
    }
    return groups;
  }, [results]);

  const handleSearch = async () => {
    const trimmed = keyword.trim();
    // Server đã require keyword non-empty — sớm return ở client để tránh round-trip vô ích.
    if (!trimmed) return;
    setLoading(true);
    try {
      const data = await searchMessages(conversationId, trimmed);
      setResults(data);
      setSearchedKeyword(trimmed);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // IME (bộ gõ tiếng Việt/Nhật/Trung/Hàn) bắn 2 keydown khi nhấn Enter — 1 với
    // isComposing=true (commit IME) và 1 với isComposing=false (Enter thật).
    // Không guard → API search bị gọi 2 lần. Xem docs/IME_BUG_FIX.md.
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div
      className={`absolute top-0 pb-4 ${showSearch ? "z-10" : "z-0"} bg-(--bg-color) flex h-full w-full flex-col`}
    >
      {/* Header chỉ tiêu đề — đóng panel bằng cách click lại icon Search trên ChatboxHeaderMenu. */}
      <div className="border-b-(--border-color) panel-header-h bg-(--bg-color) flex items-center border-b-[.1rem] px-4">
        <p className="text-base font-medium">Search messages</p>
      </div>

      {/* Search input — dùng ModalSearchInput để đồng bộ diện mạo với ô search ở các
          modal (box bo góc, viền modal, icon kính lúp trái, focus xanh). Icon kính lúp
          làm trigger phụ ngoài Enter (mobile/mouse), mờ khi keyword rỗng/đang tải. */}
      <div className="px-4 py-3">
        <ModalSearchInput
          inputRef={refInput}
          placeholder="Type keyword..."
          onChange={(e) => {
            const v = e.target.value;
            setKeyword(v);
            // Yêu cầu #2: xoá trắng ô search → clear luôn list kết quả bên dưới.
            if (v.trim() === "") {
              setResults([]);
              setSearched(false);
              setSearchedKeyword("");
            }
          }}
          onKeyDown={handleKeyDown}
          onIconClick={handleSearch}
          iconDisabled={loading || !keyword.trim()}
        />
      </div>

      {/* Kết quả */}
      <div className="hide-scrollbar flex grow flex-col overflow-y-auto">
        {loading && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            Searching...
          </p>
        )}
        {!loading && searched && results.length === 0 && (
          <p className="text-(--text-main-color-blur) p-4 text-center">
            No matches
          </p>
        )}
        {!loading &&
          groupedResults.map((group) => (
            <div key={group.key} className="flex flex-col">
              {/* Month separator — căn trái, font lớn hơn để dễ nhận diện ranh giới giữa các tháng */}
              <div className="text-2xs text-(--text-main-color) bg-(--bg-color-extrathin) px-4 py-2 text-left font-semibold">
                {group.label}
              </div>
              {group.items.map((m) => {
                const sender = m.contactId
                  ? contactById.get(m.contactId)
                  : undefined;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleResultClick(m.id)}
                    className="border-b-(--border-color) hover:bg-(--bg-color-extrathin) flex cursor-pointer items-start gap-3 border-b-[.1rem] px-4 py-3"
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
                      {/* Hàng trên: tên + thời gian HH:mm góc phải */}
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
                        {renderContent(m.content, searchedKeyword)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
};

export default InformationSearch;
