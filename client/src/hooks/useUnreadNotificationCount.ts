import { useInfiniteNotifications } from "./useNotification";

// Số notification CHƯA ĐỌC cho badge đỏ trên icon bell ở sidebar (thấy noti mới
// ngay cả khi đang ở menu khác).
//
// QUAN TRỌNG: dùng CHUNG query ["notifications","infinite"] với trang /notifications
// (tab "Unread"). Cùng một cache ⇒ badge và tab Unread LUÔN khớp số, không lệch do
// hai lần fetch khác thời điểm. Cách đếm trùng khít với `unreadCount` trong Notification.tsx.
//
// Sidebar luôn mounted trong _layout nên query này active sẵn:
//  - read/readAll cross-invalidate ⇒ badge giảm khi đã đọc.
//  - classifyNotification invalidate ⇒ badge tăng realtime khi có noti mới.
export const useUnreadNotificationCount = (): number => {
  const { data } = useInfiniteNotifications();
  return (data?.pages ?? []).flat().filter((n) => !n.read).length;
};

export default useUnreadNotificationCount;
