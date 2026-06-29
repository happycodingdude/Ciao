/**
 * Overlay "đang tải tin nhắn cũ hơn" — ĐÈ LÊN đỉnh khung chat khi cuộn lên top.
 *
 * Hiệu ứng: luồng sáng + blur chiếu từ trên xuống (sáng/blur mạnh ở mép trên, tan dần xuống dưới),
 * phủ lên các tin nhắn phía sau, text trạng thái nằm trong vùng sáng.
 *
 * QUAN TRỌNG: `absolute` + `pointer-events-none` — KHÔNG chiếm layout height, không chặn tương tác.
 * Khung chat dùng cơ chế bù `scrollHeight` (useChatboxScroll) để giữ vị trí đọc khi prepend trang
 * cũ; overlay chiếm chỗ trong flow sẽ làm sai delta height → nhảy vị trí.
 *
 * Blur dùng cường độ MẠNH (md) có chủ đích: blur yếu chỉ làm các bubble trắng phía sau nhoè thành
 * các "đốm" lợn cợn; blur mạnh hoà chúng thành một lớp sương sáng đồng đều.
 */
const FetchingMoreMessages = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  const fade =
    "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)";

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-32 justify-center"
    >
      {/* Lớp blur (sương): tan dần xuống dưới qua mask gradient. */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      />
      {/* Lớp ánh sáng: sáng nhất ở mép trên rồi tan vào nền (luồng sáng từ trên xuống). */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/35 to-transparent" />
      {/* Điểm nhấn sáng toả từ đỉnh-giữa. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 120% at 50% -25%, rgba(255,255,255,0.9), transparent 70%)",
        }}
      />
      {/* Text trạng thái trong vùng sáng. */}
      <span className="text-2xs relative mt-4 font-medium tracking-wide text-[#7d93bd]">
        Loading older messages…
      </span>
    </div>
  );
};

export default FetchingMoreMessages;
