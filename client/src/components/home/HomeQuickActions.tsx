import { Link } from "@tanstack/react-router";

type QuickAction = {
  label: string;
  description: string;
  icon: string;
  gradient: string;
  to: string;
  search?: Record<string, unknown>;
};

// Các lối tắt điều hướng tới luồng chính của app
const actions: QuickAction[] = [
  {
    label: "Open messages",
    description: "Jump back into your chats",
    icon: "fa-message",
    gradient: "from-neo-blue to-neo-purple",
    to: "/conversations",
  },
  {
    label: "Find friends",
    description: "Grow your connections",
    icon: "fa-user-plus",
    gradient: "from-neo-pink to-neo-orange",
    to: "/connections",
    search: { tab: "add" },
  },
  {
    label: "Notifications",
    description: "Catch up on activity",
    icon: "fa-bell",
    gradient: "from-neo-teal to-neo-green",
    to: "/notifications",
  },
];

const HomeQuickActions = () => {
  return (
    <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
      {actions.map((action, index) => (
        <Link
          key={action.label}
          to={action.to}
          search={action.search}
          className="animate-slide-up bg-(--bg-color) hover:-translate-y-1 flex items-center gap-4
            rounded-2xl border border-(--border-color) p-4 shadow-sm transition-transform"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div
            className={`bg-linear-to-br ${action.gradient} flex aspect-square w-11 items-center
              justify-center rounded-xl text-white shadow-sm`}
          >
            <i className={`fa-solid ${action.icon}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-(--text-main-color) font-medium">
              {action.label}
            </span>
            <span className="text-(--text-main-color-blur) text-xs">
              {action.description}
            </span>
          </div>
          <i className="fa-solid fa-chevron-right text-(--text-main-color-blur) ml-auto text-xs" />
        </Link>
      ))}
    </div>
  );
};

export default HomeQuickActions;
