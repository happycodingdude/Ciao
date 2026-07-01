import { useEffect, useRef } from "react";
import { NotificationModel } from "../../types/base.types";
import { NotificationGroup } from "../../utils/notificationDisplay";
import ConnectionEmpty from "../connection/ConnectionEmpty";
import NotificationItem from "./NotificationItem";

type Props = {
  groups: NotificationGroup[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
  onOpen: (n: NotificationModel) => void;
  selectedId?: string | null;
};

const NotificationSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="bg-(--bg-color-extrathin) flex items-center gap-3 rounded-xl px-3 py-2.5"
      >
        <div className="bg-(--bg-color-light) aspect-square w-10 shrink-0 animate-pulse rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="bg-(--bg-color-light) h-3 w-2/3 animate-pulse rounded" />
          <div className="bg-(--bg-color-light) h-2 w-2/5 animate-pulse rounded" />
          <div className="bg-(--bg-color-light) h-2 w-1/4 animate-pulse rounded" />
        </div>
      </div>
    ))}
  </div>
);

const NotificationList = ({
  groups,
  isLoading,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
  onOpen,
  selectedId,
}: Props) => {
  // Scroll container = root cho IntersectionObserver; sentinel ở đáy để auto-load.
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // onLoadMore là arrow mới mỗi render → giữ ref để effect không re-subscribe liên tục.
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Auto-load khi sentinel lọt vào tầm nhìn (preload sớm 120px trước đáy).
  // NGỪNG auto khi load-more vừa lỗi → tránh retry storm: nếu vẫn observe, sentinel còn
  // trong view sẽ gọi lại onLoadMore ngay → vòng lặp đập server. Lúc lỗi để user bấm Retry.
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { root, rootMargin: "120px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  if (isLoading) return <NotificationSkeleton />;

  if (isError)
    return (
      <div className="text-(--text-main-color-blur) flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <i className="fa-regular fa-circle-xmark text-3xl opacity-40" />
        <p className="text-2xs">Couldn&apos;t load notifications.</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-(--text-main-color) hover:bg-(--bg-color-extrathin) border-(--border-color) text-2xs flex items-center gap-2 rounded-full border px-4 py-1.5 transition-colors"
        >
          <i className="fa-solid fa-rotate-right text-3xs" />
          Retry
        </button>
      </div>
    );

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  // Rỗng THẬT (không còn trang để thử) mới hiện empty. Nếu còn trang (vd tab lọc rỗng
  // nhưng trang sau có item khớp) → rơi xuống render sentinel để auto-load tiếp.
  if (total === 0 && !hasNextPage)
    return (
      <ConnectionEmpty
        icon="fa-bell-slash"
        title="No notifications"
        hint="You're all caught up. New activity will show up here."
      />
    );

  return (
    <div
      ref={scrollRef}
      className="hide-scrollbar flex flex-col gap-5 overflow-y-auto pr-1"
    >
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-1">
          <h3 className="text-(--text-main-color-blur) text-4xs px-3 font-semibold uppercase tracking-wide">
            {group.label}
          </h3>
          <div className="flex flex-col gap-3">
            {group.items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onOpen={onOpen}
                isSelected={!!selectedId && n.id === selectedId}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Sentinel auto-load (có chiều cao để observe được):
          - load-more lỗi → nút Retry thủ công (observer đã tắt auto để tránh retry storm);
          - đang tải / tab lọc rỗng còn trang (total===0) → spinner;
          - idle bình thường → trống, observer tự kích khi cuộn tới. */}
      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="text-(--text-main-color-blur) flex justify-center py-3"
        >
          {isFetchNextPageError ? (
            <button
              type="button"
              onClick={onLoadMore}
              className="text-(--text-main-color) hover:bg-(--bg-color-extrathin) border-(--border-color) text-2xs flex items-center gap-2 rounded-full border px-4 py-1.5 transition-colors"
            >
              <i className="fa-solid fa-rotate-right text-3xs" />
              Couldn&apos;t load more — Retry
            </button>
          ) : isFetchingNextPage || total === 0 ? (
            <i className="fa-solid fa-spinner text-3xs animate-spin" />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
