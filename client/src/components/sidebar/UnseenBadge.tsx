// Badge đỏ hiển thị số hội thoại chưa xem. pointer-events-none để click xuyên qua
// (không chặn ripple / điều hướng của sidebar item). Ẩn khi count = 0.
const UnseenBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span
      className="pointer-events-none absolute -right-1 -top-1 z-10 flex aspect-square min-w-[1.3rem]
      items-center justify-center rounded-full bg-red-500 px-1 text-[0.72rem] font-bold leading-none text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default UnseenBadge;
