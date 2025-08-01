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

    // Đảm bảo conversation list đã có
    const conversationCache = await queryClient.ensureQueryData(
      conversationQueryOption(1),
    );

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

    // Truyền conversationId xuống component (nếu cần)
    return { conversationId };
  },
});

function Component() {
  // Nếu bạn cần conversationId, vẫn có thể lấy từ loader
  const { conversationId } = Route.useLoaderData();

  // ✅ Dữ liệu đã sẵn sàng vì loader đã fetch
  return <ChatboxContainer />;
}

// function Component() {
//   const queryClient = useQueryClient();
//   const { conversationId } = Route.useLoaderData();
//   const [ready, setReady] = useState(false);

//   const lastFetchedConversationId = useRef<string | null>(null);

//   useEffect(() => {
//     // Nếu conversationId đã được fetch rồi → không làm gì cả
//     if (lastFetchedConversationId.current === conversationId) return;

//     let cancelled = false;
//     setReady(false);
//     lastFetchedConversationId.current = conversationId; // Đánh dấu đã fetch hội thoại này

//     // Dọn cache trước khi fetch lại
//     queryClient.removeQueries({ queryKey: ["message"] });
//     queryClient.removeQueries({ queryKey: ["attachment"] });

//     // Cập nhật cache conversation
//     queryClient.setQueryData(
//       ["conversation"],
//       (old: ConversationCache | undefined) => {
//         const data: ConversationCache = {
//           ...old,
//           selected: old?.filterConversations.find(
//             (c) => c.id === conversationId,
//           ),
//           reload: true,
//           quickChat: false,
//           message: null,
//         };
//         return data;
//       },
//     );

//     const fetchData = async () => {
//       try {
//         const [messages, attachments] = await Promise.all([
//           getMessages(conversationId, 1),
//           getAttachments(conversationId),
//         ]);

//         if (!cancelled) {
//           queryClient.setQueryData(["message"], messages);
//           queryClient.setQueryData(["attachment"], attachments);
//           setReady(true);
//         }
//       } catch (err) {
//         console.error("Fetch failed", err);
//       }
//     };

//     fetchData();

//     return () => {
//       cancelled = true;
//     };
//   }, [conversationId]);

//   if (!ready) return <LocalLoading />;
//   return <ChatboxContainer />;
// }
