import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import getConversations from "../../features/listchat/services/getConversations";
import ChatSection from "../../layouts/ChatSection";

const chatQueryOption = queryOptions({
  queryKey: ["conversation"],
  queryFn: () => getConversations(1),
});

export const Route = createFileRoute("/chats/")({
  component: ChatSection,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(chatQueryOption),
});
