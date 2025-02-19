import HttpRequest from "../../../lib/fetch";
import { MessageCache } from "../../listchat/types";

const getMessages = async (conversationId: string, page: number) => {
  const data = (
    await HttpRequest<undefined, MessageCache>({
      method: "get",
      url:
        page === 1
          ? import.meta.env.VITE_ENDPOINT_MESSAGE_GET.replace(
              "{id}",
              conversationId,
            )
          : import.meta.env.VITE_ENDPOINT_MESSAGE_GETWITHPAGING.replace(
              "{id}",
              conversationId,
            ).replace("{page}", page),
    })
  ).data;
  // const convertedMessages = data.messages.map((message) => {
  //   return { ...message, content: message.content.replace(/\n/g, " <br> ") };
  // });
  const result: MessageCache = {
    hasMore: data.hasMore,
    messages: data.messages,
    conversationId: conversationId,
  };
  return result;
};
export default getMessages;
