import HttpRequest from "../../../lib/fetch";
import { ConversationCache, ConversationModel } from "../types";

const getConversations = async (page: number) => {
  const data = (
    await HttpRequest<undefined, ConversationModel[]>({
      method: "get",
      url:
        page === 1
          ? import.meta.env.VITE_ENDPOINT_CONVERSATION_GET
          : import.meta.env.VITE_ENDPOINT_CONVERSATION_GETWITHPAGING.replace(
              "{page}",
              page,
            ),
    })
  ).data;
  const result: ConversationCache = {
    conversations: data,
    filterConversations: data,
    selected: null,
  };
  return result;
};
export default getConversations;
