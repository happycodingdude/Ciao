import { queryOptions } from "@tanstack/react-query";
import { MessageCache } from "../../listchat/types";
import getMessages from "../services/getMessages";

const messageQueryOption = (conversationId: string, page: number) =>
  queryOptions<MessageCache>({
    queryKey: ["message", conversationId],
    queryFn: () => getMessages(conversationId, page),
    staleTime: 5 * 60 * 1000,
  });

export default messageQueryOption;
