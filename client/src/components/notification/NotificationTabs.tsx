import { NotificationTab } from "../../types/notification.types";

type TabDef = { key: NotificationTab; label: string; icon: string };

const TAB_DEFS: TabDef[] = [
  { key: "all", label: "All", icon: "fa-inbox" },
  { key: "unread", label: "Unread", icon: "fa-circle-dot" },
  { key: "requests", label: "Requests", icon: "fa-user-plus" },
  { key: "system", label: "System", icon: "fa-gear" },
];

type Props = {
  active: NotificationTab;
  onChange: (tab: NotificationTab) => void;
  // Badge số lượng (vd: unread = số chưa đọc).
  counts?: Partial<Record<NotificationTab, number>>;
};

const NotificationTabs = ({ active, onChange, counts }: Props) => {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto">
      {TAB_DEFS.map((tab) => {
        const isActive = tab.key === active;
        const count = counts?.[tab.key];
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors
              ${
                isActive
                  ? "bg-light-blue-500 border-light-blue-500 font-medium text-white"
                  : "text-(--text-main-color) hover:bg-(--bg-color-extrathin) border-(--border-color)"
              }`}
          >
            <i className={`fa-solid ${tab.icon} text-xs`} />
            {tab.label}
            {count != null && count > 0 && (
              <span
                className={`flex aspect-square min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium
                  ${isActive ? "bg-white/25 text-white" : "bg-light-blue-500 text-white"}`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NotificationTabs;
