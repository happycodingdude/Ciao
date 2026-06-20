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
    <div className="laptop:grid-cols-4 grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Link
          key={stat.label}
          to={stat.to}
          search={stat.search}
          className="bg-(--bg-color) border-(--border-color) group flex animate-slide-up items-center gap-3
            rounded-2xl border p-3 shadow-sm transition-transform hover:-translate-y-1"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div
            className={`bg-linear-to-br ${stat.gradient} flex aspect-square w-11 items-center
              justify-center rounded-xl text-white shadow-sm`}
          >
            <i className={`fa-solid ${stat.icon}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-(--text-main-color) text-xl font-semibold leading-none">
              {stat.value}
            </span>
            <span className="text-(--text-main-color-blur) mt-0.5 text-xs">
              {stat.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HomeStats;
