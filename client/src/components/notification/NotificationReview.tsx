import { useNavigate } from "@tanstack/react-router";
import { NotificationModel } from "../../types/base.types";
import { notificationParts } from "../../utils/notificationDisplay";
import ConversationReview from "./ConversationReview";

const FALLBACK_AVATAR = "/assets/imagenotfound.jpg";

const EmptyReview = ({ hint }: { hint: string }) => (
  <div className="text-(--text-main-color-blur) flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
    <i className="fa-regular fa-bell text-3xl opacity-40" />
    <p className="text-2xs">{hint}</p>
  </div>
);

// friend_request không gắn hội thoại → hiện card người gửi + nút sang Connections.
const FriendRequestReview = ({
  notification,
}: {
  notification: NotificationModel;
}) => {
  const navigate = useNavigate();
  const { actorName, action } = notificationParts(notification);
  const initial = (actorName.trim()[0] ?? "?").toUpperCase();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      {notification.actorAvatar ? (
        <span
          style={{ backgroundImage: `url(${notification.actorAvatar})` }}
          className="block aspect-square w-20 rounded-full bg-(--bg-color-extrathin) bg-cover bg-center"
        />
      ) : (
        <span className="bg-light-blue-500 flex aspect-square w-20 items-center justify-center rounded-full text-2xl font-semibold text-white">
          {initial}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <span className="text-(--text-main-color) text-base font-semibold">
          {actorName}
        </span>
        <span className="text-(--text-main-color-light) text-2xs">{action}</span>
      </div>
      <button
        type="button"
        onClick={() => navigate({ to: "/connections", search: { tab: "requests" } })}
        className="bg-light-blue-500 hover:bg-light-blue-600 text-2xs flex items-center gap-2 rounded-full px-4 py-2 font-medium text-white transition-colors"
      >
        View request
        <i className="fa-solid fa-arrow-right text-3xs" />
      </button>
    </div>
  );
};

// Pane review bên phải (kiểu Teams). Read-only theo quyết định; reply inline để sau.
const NotificationReview = ({
  notification,
}: {
  notification: NotificationModel | null;
}) => {
  if (!notification)
    return <EmptyReview hint="Select a notification to preview it here." />;

  if (notification.sourceType === "friend_request")
    return <FriendRequestReview notification={notification} />;

  if (notification.sourceId)
    // key theo id notification → đổi item thì remount sạch (scroll/highlight reset).
    return (
      <ConversationReview key={notification.id} notification={notification} />
    );

  return <EmptyReview hint="Nothing to preview for this notification." />;
};

export default NotificationReview;
