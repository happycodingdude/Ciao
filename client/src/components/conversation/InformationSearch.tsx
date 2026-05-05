import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { KeyboardEvent, useState } from "react";
import { searchMessages } from "../../services/message.service";
import { MessageSearchResult } from "../../types/message.types";

type Props = {
  conversationId: string;
  onBack: () => void;
};

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
      <mark key={idx} className="bg-yellow-200 rounded px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    ),
  );
};

const InformationSearch = ({ conversationId, onBack }: Props) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  // Snapshot keyword tại thời điểm search thành công — dùng cho highlight.
  // KHÔNG dùng state `keyword` trực tiếp vì user có thể gõ tiếp sau khi đã search,
  // gây highlight lệch với kết quả đang hiển thị.
  const [searchedKeyword, setSearchedKeyword] = useState("");

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
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white">
      {/* Header với back + tiêu đề, dùng panel-header-h để border-bottom thẳng hàng các panel khác */}
      <div className="border-b-(--border-color) panel-header-h flex items-center gap-4 border-b-[.1rem] bg-white px-4">
        <ArrowLeftOutlined
          className="base-icon-sm cursor-pointer"
          onClick={onBack}
        />
        <p className="text-base font-medium">Search messages</p>
      </div>

      {/* Input + nút kính lúp gọi search */}
      <div className="border-b-(--border-color) flex items-center gap-2 border-b-[.1rem] px-4 py-3">
        <input
          autoFocus
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type keyword..."
          className="text-2xs h-10 grow rounded-3xl bg-gray-100 px-4 shadow-sm focus:shadow-md focus:outline-none"
        />
        <button
          type="button"
          disabled={loading || !keyword.trim()}
          onClick={handleSearch}
          className="bg-light-blue-400 hover:bg-light-blue-500 flex aspect-square h-10 items-center justify-center rounded-full text-white
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SearchOutlined />
        </button>
      </div>

      {/* Kết quả */}
      <div className="hide-scrollbar flex grow flex-col overflow-y-auto">
        {loading && (
          <p className="text-(--text-main-color-blur) p-4 text-center">Searching...</p>
        )}
        {!loading && searched && results.length === 0 && (
          <p className="text-(--text-main-color-blur) p-4 text-center">No matches</p>
        )}
        {!loading && results.map((m) => (
          <div
            key={m.id}
            className="border-b-(--border-color) hover:bg-(--bg-color-extrathin) flex flex-col gap-1 border-b-[.1rem] px-4 py-3"
          >
            <p className="text-2xs break-words">
              {highlightKeyword(m.content, searchedKeyword)}
            </p>
            <p className="text-3xs text-(--text-main-color-blur)">
              {m.createdTime ? dayjs(m.createdTime).format("DD/MM/YYYY HH:mm") : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformationSearch;
