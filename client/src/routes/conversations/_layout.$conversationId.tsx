import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import LocalLoading from "../../components/LocalLoading";
import getMessages from "../../features/chatbox/services/getMessages";
import getAttachments from "../../features/chatdetail/services/getAttachments";
import conversationQueryOption from "../../features/listchat/queries/conversationQuery";
import { ConversationCache } from "../../features/listchat/types";
import ChatboxContainer from "../../layouts/ChatboxContainer";

export const Route = createFileRoute("/conversations/_layout/$conversationId")({
  // component: Component,
  // component: lazy(() => import("../../layouts/ChatboxContainer")),
  component: Component,
  loader: async ({ params, context }) => {
    const { queryClient } = context;
    const conversationId = params.conversationId;

    await queryClient.ensureQueryData(conversationQueryOption);

    // Không fetch messages tại đây nữa
    return { conversationId };
  },
  preload: false,
});

function Component() {
  const queryClient = useQueryClient();
  const { conversationId } = Route.useLoaderData();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    queryClient.setQueryData(
      ["conversation"],
      (oldData: ConversationCache | undefined) => {
        const data: ConversationCache = {
          ...oldData,
          selected: oldData.filterConversations.find(
            (item) => item.id === conversationId,
          ),
          reload: true,
          quickChat: false,
          message: null,
        };
        return data;
      },
    );

    Promise.all([
      getMessages(conversationId, 1).then((messages) =>
        queryClient.setQueryData(["message"], messages),
      ),
      getAttachments(conversationId).then((attachments) =>
        queryClient.setQueryData(["attachment"], attachments),
      ),
    ]).then(() => {
      setReady(true);
    });
  }, [conversationId]);

  if (!ready) return <LocalLoading />;

  return <ChatboxContainer />;
}
