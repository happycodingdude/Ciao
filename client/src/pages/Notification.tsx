import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import NotificationList from "../components/notification/NotificationList";
import NotificationTabs from "../components/notification/NotificationTabs";
import { useInfiniteNotifications } from "../hooks/useNotification";
import { read, readAll } from "../services/notification.service";
import { NotificationModel } from "../types/base.types";
import { NotificationTab } from "../types/notification.types";
import { groupByDay, matchesTab } from "../utils/notificationDisplay";

// Route api riêng để đọc/ghi ?tab= mà không import vòng (route file import page này).
const routeApi = getRouteApi("/_layout/notifications");

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

  // Refetch strategy (không vá realtime cache): làm mới khi vào trang.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications", "infinite"] });
    queryClient.invalidateQueries({ queryKey: ["notification"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const all = useMemo<NotificationModel[]>(
    () => (data?.pages ?? []).flat(),
    [data],
  );
  const unreadCount = useMemo(
    () => all.filter((n) => !n.read).length,
    [all],
  );
  const requestCount = useMemo(
    () => all.filter((n) => n.sourceType === "friend_request" && !n.read).length,
    [all],
  );

  const filtered = useMemo(
    () => all.filter((n) => matchesTab(n, tab)),
    [all, tab],
  );
  const groups = useMemo(() => groupByDay(filtered), [filtered]);

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

  const onOpen = (n: NotificationModel) => {
    if (!n.read && n.id) readMutation(n.id);
    // Deep-link theo sourceType + sourceId.
    if (n.sourceType === "friend_request") {
      navigate({ to: "/connections", search: { tab: "requests" } });
    } else if (n.sourceId) {
      navigate({
        to: "/conversations/$conversationId",
        params: { conversationId: n.sourceId },
      });
    }
  };

  const setTab = (next: NotificationTab) => setSearch({ search: { tab: next } });

  return (
    <section className="bg-(--bg-color) relative h-screen w-full overflow-hidden">
      {/* #portal (global CSS có height:100%) phải nằm NGOÀI flex container — nếu không nó
          thành flex-item chiếm hết chiều cao và ép vùng flex-1 co về 0. */}
      <div className="flex h-full flex-col">
        {/* Header + tabs cố định (shrink-0); chỉ list bên dưới scroll. */}
        <div className="mx-auto flex w-full max-w-3xl shrink-0 flex-col gap-6 px-6 pt-6">
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-(--text-main-color) flex items-center gap-3 text-2xl font-semibold">
                <i className="fa-solid fa-bell text-light-blue-500" />
                Informations
              </h1>
              <p className="text-(--text-main-color-blur) text-sm">
                Stay up to date with requests and activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => unreadCount > 0 && readAllMutation()}
              disabled={unreadCount === 0 || markingAll}
              className="text-(--text-main-color) hover:bg-(--bg-color-extrathin) border-(--border-color) flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              <i
                className={`fa-solid ${
                  markingAll ? "fa-spinner animate-spin" : "fa-check-double"
                } text-xs`}
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
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden px-6 pb-6 pt-6">
          <NotificationList
            groups={groups}
            isLoading={isLoading}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            onOpen={onOpen}
          />
        </div>
      </div>

      <div id="portal"></div>
    </section>
  );
};

export default Notification;
