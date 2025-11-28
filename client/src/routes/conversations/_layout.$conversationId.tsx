import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import ChatboxLoading from "../../components/ChatboxLoading";
import useMessage from "../../features/chatbox/hooks/useMessage";
import useConversation from "../../features/listchat/hooks/useConversation";
import { ConversationCache, MessageCache } from "../../features/listchat/types";
import ChatboxContainer from "../../layouts/ChatboxContainer";

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

    // Check if queries are already fetching or have pending messages
    const messageQueryState = queryClient.getQueryState([
      "message",
      conversationId,
    ]);
    const messageCache = queryClient.getQueryData<MessageCache>([
      "message",
      conversationId,
    ]);
    const hasPendingMessages = messageCache?.messages?.some(
      (msg) => msg.pending === true,
    );
    const isFetching = messageQueryState?.fetchStatus === "fetching";

    console.log("Loader check:", {
      conversationId,
      hasPendingMessages,
      isFetching,
      messageCount: messageCache?.messages?.length,
    });

    // Only invalidate if:
    // 1. NOT currently fetching (prevent multiple simultaneous requests)
    // 2. NO pending messages (preserve QuickChat messages)
    if (!isFetching && !hasPendingMessages) {
      console.log("Invalidating cache for refresh");
      queryClient.invalidateQueries({ queryKey: ["message", conversationId] });
      queryClient.invalidateQueries({
        queryKey: ["attachment", conversationId],
      });
    } else {
      console.log("Skipping invalidate:", { isFetching, hasPendingMessages });
    }

    return { conversationId };
  },

  component: () => {
    const { conversationId } = Route.useLoaderData();

    // Use useEffect to avoid infinite re-renders
    useEffect(() => {
      localStorage.setItem("conversationId", conversationId);
      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("localstorage-changed", {
          detail: { key: "conversationId" },
        }),
      );
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

    return <ChatboxContainer />;
  },
});
