import useConversation from "./useConversation";

// Số hội thoại đang có tin CHƯA XEM (unSeen). Dùng cho badge trên icon Conversations ở sidebar.
// Cập nhật realtime tức thì kể cả khi đang ở menu khác: cache ["conversation"] được
// onNewMessage/onNewConversation patch trực tiếp (unSeen = !isActive), và sidebar luôn mounted
// trong _layout nên useQuery tự re-render khi cache đổi.
export const useUnseenConversationCount = (): number => {
  const { data } = useConversation();
  return (data?.conversations ?? []).filter((c) => c.unSeen).length;
};

export default useUnseenConversationCount;
