import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import NotificationList from "../components/notification/NotificationList";
import NotificationReview from "../components/notification/NotificationReview";
import NotificationTabs from "../components/notification/NotificationTabs";
import { useInfiniteNotifications } from "../hooks/useNotification";
import { read, readAll } from "../services/notification.service";
import { NotificationModel } from "../types/base.types";
import { NotificationTab } from "../types/notification.types";
import { groupByDay, matchesTab } from "../utils/notificationDisplay";

// Route api riêng để đọc/ghi ?tab= mà không import vòng (route file import page này).
const routeApi = getRouteApi("/_layout/notifications");

// Pane review chỉ hiện ở màn ≥ laptop-sm (1024px). Dưới ngưỡng đó: click → điều hướng.
const isWideScreen = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 1024px)").matches;

const Notification = () => {
  const { tab } = routeApi.useSearch();
  const setSearch = routeApi.useNavigate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications();

  // Làm mới khi vào trang được xử lý qua staleTime:0 + refetchOnMount của query
  // (xem useInfiniteNotifications) — KHÔNG invalidate thủ công ở đây để tránh
  // fetch 2 lần (mount fetch + invalidate refetch).

  // Sort mới nhất lên đầu (BE chưa sort). createdTime ISO ⇒ so sánh chuỗi đủ đúng,
  // nhưng dùng Date cho an toàn timezone. Copy trước khi sort để không mutate cache.
  const all = useMemo<NotificationModel[]>(
    () =>
      (data?.pages ?? [])
        .flat()
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdTime ?? 0).getTime() -
            new Date(a.createdTime ?? 0).getTime(),
        ),
    [data],
  );
  const unreadCount = useMemo(() => all.filter((n) => !n.read).length, [all]);
  const requestCount = useMemo(
    () => all.filter((n) => n.sourceType === "friend_request" && !n.read).length,
    [all],
  );

  const filtered = useMemo(
    () => all.filter((n) => matchesTab(n, tab)),
    [all, tab],
  );
  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  // Selection cho pane review. Giữ theo id để object luôn fresh khi cache refetch.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => filtered.find((n) => n.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  // Auto-chọn item đầu để preview (chỉ ở màn rộng). KHÔNG mark read khi auto-select —
  // chỉ mark read khi user bấm thật (onSelect).
  useEffect(() => {
    if (!isWideScreen()) return;
    if (selectedId && filtered.some((n) => n.id === selectedId)) return;
    setSelectedId(filtered[0]?.id ?? null);
  }, [filtered, selectedId]);

  // read/readAll dùng cache riêng cho trang + cross-invalidate ["notification"] (badge sidebar).
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications", "infinite"] });
    queryClient.invalidateQueries({ queryKey: ["notification"] });
  };

  const { mutate: readMutation } = useMutation({
    mutationFn: (id: string) => read(id),
    onSuccess: invalidate,
  });
  const { mutate: readAllMutation, isPending: markingAll } = useMutation({
    mutationFn: readAll,
    onSuccess: invalidate,
  });

  const onSelect = (n: NotificationModel) => {
    if (!n.read && n.id) readMutation(n.id);

    // Màn hẹp không có pane review → điều hướng thẳng (giữ hành vi cũ).
    if (!isWideScreen()) {
      if (n.sourceType === "friend_request")
        navigate({ to: "/connections", search: { tab: "requests" } });
      else if (n.sourceId)
        navigate({
          to: "/conversations/$conversationId",
          params: { conversationId: n.sourceId },
        });
      return;
    }

    setSelectedId(n.id ?? null);
  };

  const setTab = (next: NotificationTab) => setSearch({ search: { tab: next } });

  return (
    <section className="bg-(--bg-color) relative h-screen w-full overflow-hidden">
      <div className="flex h-full">
        {/* ── Cột trái: Activity list (hẹp, kiểu Teams) ── */}
        {/* h-full: fill <section> (đã h-screen). KHÔNG dùng h-screen ở đây — section
            chỉ cao 100vh, mọi con nội bộ phải clamp theo parent, nếu không scrollIntoView
            trong pane phải sẽ cuộn cả khung và cắt header. */}
        <div className="border-(--border-color) laptop-sm:w-100 laptop-sm:shrink-0 laptop-sm:border-r flex h-full w-full flex-col">
          {/* Header + tabs cố định (shrink-0); chỉ list bên dưới scroll. */}
          <div className="flex shrink-0 flex-col gap-3 px-4 pt-5">
            <header className="flex items-center justify-between gap-3 px-1">
              <h1 className="text-(--text-main-color) text-base font-bold">
                Activity
              </h1>

              <button
                type="button"
                onClick={() => unreadCount > 0 && readAllMutation()}
                disabled={unreadCount === 0 || markingAll}
                className="text-(--text-main-color-light) hover:bg-(--bg-color-extrathin) text-3xs flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors disabled:opacity-40"
              >
                <i
                  className={`fa-solid ${markingAll ? "fa-spinner animate-spin" : "fa-check-double"
                    } text-3xs`}
                />
                Mark all as read
              </button>
            </header>

            <NotificationTabs
              active={tab}
              onChange={setTab}
              counts={{ unread: unreadCount, requests: requestCount }}
            />
          </div>

          {/* Vùng list — flex-1 + min-h-0 + overflow-hidden để list tự cuộn nội bộ. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-6 pt-3">
            <NotificationList
              groups={groups}
              isLoading={isLoading}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              onOpen={onSelect}
              selectedId={selectedId}
            />
          </div>
        </div>

        {/* ── Cột phải: pane review (chỉ màn rộng) ── */}
        <div className="laptop-sm:block hidden h-full grow overflow-hidden">
          <NotificationReview notification={selected} />
        </div>
      </div>

      {/* #portal (global CSS height:100%) phải nằm NGOÀI flow: 'absolute' để KHÔNG cộng
          100vh vào chiều cao section (gây 200vh → scrollIntoString của pane phải cuộn cả
          khung, cắt header). 'empty:hidden' để khi rỗng không che/chặn click; chỉ hiện khi
          video-call inject child (overlay đè lên, không ảnh hưởng layout). */}
      <div id="portal" className="absolute inset-0 z-50 empty:hidden"></div>
    </section>
  );
};

export default Notification;
