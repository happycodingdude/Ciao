import { createFileRoute } from "@tanstack/react-router";
import ChatboxLoading from "../../components/ChatboxLoading";
import useMessage from "../../features/chatbox/hooks/useMessage";
import useConversation from "../../features/listchat/hooks/useConversation";
import { ConversationCache } from "../../features/listchat/types";
import ChatboxContainer from "../../layouts/ChatboxContainer";

// export const Route = createFileRoute("/conversations/_layout/$conversationId")({
//   loader: async ({ params, context }) => {
//     const { queryClient } = context;
//     const conversationId = params.conversationId;
//     localStorage.setItem("conversationId", conversationId);

//     const messagesPromise = defer(
//       queryClient.ensureQueryData(messageQueryOption(conversationId, 1)),
//     );
//     const attachmentsPromise = defer(
//       queryClient.ensureQueryData(attachmentQueryOption(conversationId)),
//     );

//     return {
//       messagesPromise,
//       attachmentsPromise,
//     };
//   },
//   component: () => {
//     const { messagesPromise } = Route.useLoaderData();
//     return (
//       <Suspense fallback={<LocalLoading />}>
//         <Await promise={messagesPromise}>
//           {(data) => <ChatboxContainer />}
//         </Await>
//       </Suspense>
//     );
//   },
// });

export const Route = createFileRoute("/conversations/_layout/$conversationId")({
  loader: async ({ params, context }) => {
    const { queryClient } = context;
    const conversationId = params.conversationId;

    // Save current conversationId (optional)
    localStorage.setItem("conversationId", conversationId);

    // Set conversation cache to mark as read
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      if (!oldData) return oldData;

      const updatedConversations = oldData.conversations?.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              unSeen: false, // Mark as read
            }
          : conv,
      );
      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
      } as ConversationCache;
    });

    // Invalidate cache to force refetch in component
    queryClient.invalidateQueries({ queryKey: ["message", conversationId] });
    queryClient.invalidateQueries({ queryKey: ["attachment", conversationId] });

    return { conversationId };
  },

  component: () => {
    const { conversationId } = Route.useLoaderData();
    const {
      isLoading: isLoadingConversation,
      isRefetching: isRefetchingConversation,
    } = useConversation();
    const { isLoading: isLoadingMessages, isRefetching: isRefetchingMessages } =
      useMessage(conversationId, 1);
    if (
      isLoadingConversation ||
      isRefetchingConversation ||
      isLoadingMessages ||
      isRefetchingMessages
    )
      return <ChatboxLoading />;

    return <ChatboxContainer />;
    // return <ChatboxLoading />;
  },
});
