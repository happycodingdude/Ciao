import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import ChatboxLoading from "../../components/common/ChatboxLoading";
import ChatboxContainer from "../../components/layouts/ChatboxContainer";
import { setActiveConversation } from "../../hooks/useActiveConversation";
import useConversation from "../../hooks/useConversation";
import useMessage from "../../hooks/useMessage";
import { ConversationCache } from "../../types/conv.types";

// ✅ Lazy load heavy component to reduce initial bundle
// const ChatboxContainer = lazy(() => import("../../layouts/ChatboxContainer"));

export const Route = createFileRoute("/conversations/_layout/$conversationId")({
  loader: async ({ params, context }) => {
    const { queryClient } = context;
    const conversationId = params.conversationId;

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

    // await queryClient.ensureQueryData(conversationQueryOption(1));

    // await queryClient.ensureQueryData(messageQueryOption(conversationId, 1));

    // // Check if queries are already fetching or have pending messages
    // const messageQueryState = queryClient.getQueryState([
    //   "message",
    //   conversationId,
    // ]);
    // const messageCache = queryClient.getQueryData<MessageCache>([
    //   "message",
    //   conversationId,
    // ]);
    // const hasPendingMessages = messageCache?.messages?.some(
    //   (msg) => msg.pending === true,
    // );
    // const isFetching = messageQueryState?.fetchStatus === "fetching";

    // // ✅ Only log in development
    // if (import.meta.env.DEV) {
    //   console.log("Loader check:", {
    //     conversationId,
    //     hasPendingMessages,
    //     isFetching,
    //     messageCount: messageCache?.messages?.length,
    //   });
    // }

    return { conversationId };
  },

  component: () => {
    const { conversationId } = Route.useParams();
    console.log("Rendering Conversation Layout for ID:", conversationId);

    // UseEffect chỉ để sync active conversation
    useEffect(() => {
      if (!conversationId) return;

      setActiveConversation(conversationId);

      return () => {
        // Khi rời conversation (unmount hoặc route change)
        setActiveConversation(null);
      };
    }, [conversationId]);

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

    // ✅ Wrap lazy component with Suspense
    return <ChatboxContainer />;
  },
});
