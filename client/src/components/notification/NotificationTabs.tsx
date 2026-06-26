import { NotificationTab } from "../../types/notification.types";

type TabDef = { key: NotificationTab; label: string };

// Pill tối giản kiểu Teams (Unread / @Mentions...). Bỏ icon, chỉ chữ + badge số nhỏ.
const TAB_DEFS: TabDef[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "requests", label: "Requests" },
  { key: "system", label: "System" },
];

type Props = {
  active: NotificationTab;
  onChange: (tab: NotificationTab) => void;
  // Badge số lượng (vd: unread = số chưa đọc).
  counts?: Partial<Record<NotificationTab, number>>;
};

const NotificationTabs = ({ active, onChange, counts }: Props) => {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-1">
      {TAB_DEFS.map((tab) => {
        const isActive = tab.key === active;
        const count = counts?.[tab.key];
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`text-2xs flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 transition-colors
              ${
                isActive
                  ? "border-transparent bg-(--bg-color-extrathin) text-(--text-main-color) font-medium"
                  : "text-(--text-main-color-light) hover:bg-(--bg-color-extrathin) border-(--border-color)"
              }`}
          >
            {tab.label}
            {count != null && count > 0 && (
              <span className="bg-light-blue-500 flex aspect-square min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium text-white">
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
