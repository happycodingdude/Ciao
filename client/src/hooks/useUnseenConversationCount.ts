import useConversation from "./useConversation";
import useInfo from "./useInfo";

// Số hội thoại đang có tin CHƯA XEM (unSeen). Dùng cho badge trên icon Conversations ở sidebar.
// Cập nhật realtime tức thì kể cả khi đang ở menu khác: cache ["conversation"] được
// onNewMessage/onNewConversation patch trực tiếp (unSeen = !isActive), và sidebar luôn mounted
// trong _layout nên useQuery tự re-render khi cache đổi.
//
// QUAN TRỌNG: đếm CÙNG TẬP với list hiển thị (ListchatContent) — chỉ hội thoại mà user còn là
// thành viên ACTIVE (member khớp id + !isDeleted). Nếu chỉ `filter(unSeen)` trần thì badge đếm
// cả hội thoại user đã rời / không còn là member → lệch số với danh sách.
export const useUnseenConversationCount = (): number => {
  const { data } = useConversation();
  const { data: info } = useInfo();
  return (data?.conversations ?? []).filter(
    (c) =>
      c.unSeen &&
      (c.members ?? []).some((m) => m.contact?.id === info?.id && !m.isDeleted),
  ).length;
};

export default useUnseenConversationCount;
