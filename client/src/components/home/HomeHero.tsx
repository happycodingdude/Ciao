import dayjs from "dayjs";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

type Props = {
  name?: string;
  avatar?: string;
  isOnline?: boolean;
  unreadCount: number;
};

// Lời chào theo khung giờ trong ngày (deterministic theo giờ hiện tại)
const getGreeting = (hour: number) => {
  if (hour < 12) return { text: "Good morning", icon: "fa-mug-hot" };
  if (hour < 18) return { text: "Good afternoon", icon: "fa-sun" };
  return { text: "Good evening", icon: "fa-moon" };
};

const HomeHero = ({ name, avatar, isOnline, unreadCount }: Props) => {
  const now = dayjs();
  const greeting = getGreeting(now.hour());

  return (
    <div
      className="animate-fade-in bg-linear-to-br from-light-blue-400 to-light-blue-600 relative
        overflow-hidden rounded-3xl p-6 text-white shadow-md"
    >
      {/* Khối trang trí mềm phía sau, không bắt sự kiện chuột */}
      <div className="pointer-events-none absolute -right-10 -top-10 aspect-square w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 right-24 aspect-square w-48 rounded-full bg-white/10" />

      <div className="relative flex items-center gap-5">
        <div className="relative">
          <ImageWithLightBoxAndNoLazy
            src={avatar}
            className="aspect-square w-16 ring-4 ring-white/40"
            circle
            slides={[{ src: avatar ?? "" }]}
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 aspect-square w-4 rounded-full border-2 border-white
              ${isOnline ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
          />
        </div>

        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-sm font-light opacity-90">
            <i className={`fa-solid ${greeting.icon}`} />
            {greeting.text}
          </p>
          <h1 className="text-2xl font-semibold">{name ?? "there"}</h1>
          <p className="mt-1 text-xs opacity-80">
            {now.format("dddd, MMMM D")} ·{" "}
            {unreadCount > 0
              ? `You have ${unreadCount} unread conversation${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up 🎉"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
