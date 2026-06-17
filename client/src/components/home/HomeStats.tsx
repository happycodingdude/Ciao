import { Link } from "@tanstack/react-router";

export type HomeStat = {
  label: string;
  value: number;
  icon: string;
  // Cặp gradient (from/to) đặt theo class Tailwind đã cấu hình
  gradient: string;
  to: string;
  // Search param tuỳ chọn để deep-link tới đúng tab (vd Connections ?tab=requests).
  search?: Record<string, unknown>;
};

type Props = {
  stats: HomeStat[];
};

const HomeStats = ({ stats }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4 laptop:grid-cols-4">
      {stats.map((stat, index) => (
        <Link
          key={stat.label}
          to={stat.to}
          search={stat.search}
          className="animate-slide-up bg-(--bg-color) hover:-translate-y-1 group flex items-center gap-4
            rounded-2xl border border-(--border-color) p-4 shadow-sm transition-transform"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div
            className={`bg-linear-to-br ${stat.gradient} flex aspect-square w-12 items-center
              justify-center rounded-xl text-lg text-white shadow-sm`}
          >
            <i className={`fa-solid ${stat.icon}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-(--text-main-color) text-2xl font-semibold leading-none">
              {stat.value}
            </span>
            <span className="text-(--text-main-color-blur) mt-1 text-xs">
              {stat.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HomeStats;
