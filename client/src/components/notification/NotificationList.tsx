import ConnectionEmpty from "../connection/ConnectionEmpty";
import { NotificationModel } from "../../types/base.types";
import { NotificationGroup } from "../../utils/notificationDisplay";
import NotificationItem from "./NotificationItem";

type Props = {
  groups: NotificationGroup[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
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
        <div className="aspect-square w-11 shrink-0 animate-pulse rounded-full bg-(--bg-color-light)" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-(--bg-color-light)" />
          <div className="h-2 w-2/5 animate-pulse rounded bg-(--bg-color-light)" />
          <div className="h-2 w-1/4 animate-pulse rounded bg-(--bg-color-light)" />
        </div>
      </div>
    ))}
  </div>
);

const NotificationList = ({
  groups,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onOpen,
  selectedId,
}: Props) => {
  if (isLoading) return <NotificationSkeleton />;

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  if (total === 0)
    return (
      <ConnectionEmpty
        icon="fa-bell-slash"
        title="No notifications"
        hint="You're all caught up. New activity will show up here."
      />
    );

  return (
    <div className="hide-scrollbar flex flex-col gap-5 overflow-y-auto pr-1">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-1">
          <h3 className="text-(--text-main-color-blur) px-3 text-xs font-semibold uppercase tracking-wide">
            {group.label}
          </h3>
          <div className="flex flex-col">
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

      {hasNextPage && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className="text-(--text-main-color) hover:bg-(--bg-color-extrathin) border-(--border-color) mx-auto mt-1 flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-60"
        >
          <i
            className={`fa-solid ${
              isFetchingNextPage ? "fa-spinner animate-spin" : "fa-chevron-down"
            } text-xs`}
          />
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
};

export default NotificationList;
