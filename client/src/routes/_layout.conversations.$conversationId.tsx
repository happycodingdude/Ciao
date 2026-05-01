import {
  createFileRoute,
  ErrorComponent,
  ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";
import ChatboxLoading from "../components/common/ChatboxLoading";
import ChatboxContainer from "../components/layouts/ChatboxContainer";
import { setActiveConversation } from "../hooks/useActiveConversation";
import useConversation from "../hooks/useConversation";
import useMessage from "../hooks/useMessage";
import { ConversationCache } from "../types/conv.types";

export const Route = createFileRoute("/_layout/conversations/$conversationId")({
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

    return { conversationId };
  },

  errorComponent: ({ error, reset }: ErrorComponentProps) => {
    return (
      <div>
        <h1>Đã có lỗi xảy ra!</h1>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Thử lại</button>
        {/* Hoặc sử dụng ErrorComponent mặc định của thư viện để debug */}
        <ErrorComponent error={error} />
      </div>
    );
  },

  component: () => {
    const { conversationId } = Route.useParams();

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

    return <ChatboxContainer />;
  },
});
