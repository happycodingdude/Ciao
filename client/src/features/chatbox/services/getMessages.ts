import HttpRequest from "../../../lib/fetch";
import { MessageCache } from "../../listchat/types";

const getMessages = async (conversationId: string, page: number) => {
  return (
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
};
export default getMessages;
