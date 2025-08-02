import { createFileRoute } from "@tanstack/react-router";
import getMessages from "../../features/chatbox/services/getMessages";
import getAttachments from "../../features/chatdetail/services/getAttachments";
import conversationQueryOption from "../../features/listchat/queries/conversationQuery";
import ChatboxContainer from "../../layouts/ChatboxContainer";

export const Route = createFileRoute("/conversations/_layout/$conversationId")({
  component: Component,
  loader: async ({ params, context }) => {
    const { queryClient } = context;
    const conversationId = params.conversationId;
    localStorage.setItem("conversationId", conversationId);
    // history.replaceState({ lastConversationId: conversationId }, "");

    // Đảm bảo conversation list đã có
    const conversationCache = await queryClient.ensureQueryData(
      conversationQueryOption(1),
    );

    // if (conversationCache.selected?.id === conversationId) return;

    // Tìm hội thoại đang chọn và cập nhật vào cache "conversation"
    queryClient.setQueryData(["conversation"], {
      ...conversationCache,
      selected: conversationCache.filterConversations.find(
        (c) => c.id === conversationId,
      ),
      reload: true,
      quickChat: false,
      message: null,
    });

    // Gọi API lấy messages và attachments
    const [messages, attachments] = await Promise.all([
      getMessages(conversationId, 1),
      getAttachments(conversationId),
    ]);

    // Cập nhật cache
    queryClient.setQueryData(["message"], messages);
    queryClient.setQueryData(["attachment"], attachments);

    return;
  },
});

function Component() {
  // ✅ Dữ liệu đã sẵn sàng vì loader đã fetch
  return <ChatboxContainer />;
}
