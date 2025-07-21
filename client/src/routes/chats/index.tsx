import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import getConversations from "../../features/listchat/services/getConversations";

const chatQueryOption = queryOptions({
  queryKey: ["conversation"],
  queryFn: () => getConversations(1),
});

export const Route = createFileRoute("/chats/")({
  component: lazy(() => import("../../layouts/ChatSection")),
  loader: async ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(chatQueryOption),
  preload: false,
});
