import dayjs from "dayjs";
import { ReactNode } from "react";

// Helper dùng chung cho các panel dạng "search list" ở sidebar phải
// (InformationSearch, InformationBookmark): highlight keyword + render mention + format thời gian.

// Escape user input trước khi đưa vào RegExp để tránh ký tự đặc biệt phá pattern.
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Tách text thành các đoạn matched / unmatched theo keyword (case-insensitive),
// trả về array React node để render <mark> cho phần matched.
// Dùng split với capturing group: kết quả xen kẽ unmatched - matched - unmatched - ...
export const highlightKeyword = (text: string, keyword: string) => {
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
export const renderContent = (text: string, keyword: string): ReactNode => {
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
export const formatMonthLabel = (date: dayjs.Dayjs) => {
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
export const formatMessageTime = (date: dayjs.Dayjs) => {
  const isToday = date.startOf("day").isSame(dayjs().startOf("day"));
  return isToday ? date.format("HH:mm") : date.format("DD/MM");
};
