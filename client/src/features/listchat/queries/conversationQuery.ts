import { queryOptions } from "@tanstack/react-query";
import getConversations from "../services/getConversations";

const conversationQueryOption = queryOptions({
  queryKey: ["conversation"],
  queryFn: () => getConversations(1),
});

export default conversationQueryOption;
