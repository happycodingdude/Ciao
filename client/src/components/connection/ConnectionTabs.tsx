import { ConnectionTab } from "../../types/connection.types";

type TabDef = { key: ConnectionTab; label: string; icon: string };

const TAB_DEFS: TabDef[] = [
  { key: "all", label: "All friends", icon: "fa-user-group" },
  { key: "online", label: "Online", icon: "fa-circle" },
  { key: "requests", label: "Requests", icon: "fa-user-clock" },
  { key: "add", label: "Add friend", icon: "fa-user-plus" },
];

type Props = {
  active: ConnectionTab;
  onChange: (tab: ConnectionTab) => void;
  // Badge số lượng cho từng tab (vd: requests = số lời mời nhận).
  counts?: Partial<Record<ConnectionTab, number>>;
};

const ConnectionTabs = ({ active, onChange, counts }: Props) => {
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
            <i
              className={`fa-solid ${tab.icon} ${
                tab.key === "online" && !isActive ? "text-(--online-color)" : ""
              } text-xs`}
            />
            {tab.label}
            {count != null && count > 0 && (
              <span
                className={`flex aspect-square min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium
                  ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-light-blue-500 text-white"
                  }`}
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

export default ConnectionTabs;
